# 🔴 DEEP CODE QUALITY AUDIT — lynchweddingsite.vercel.app

**Audited:** 2026-07-29  
**Total files:** ~75 source files  
**Issues found:** 42 (5 Critical, 12 High, 10 Medium, 8 Low, 7 Enhancement)

---

## 🔴 CRITICAL ISSUES (5)

### C1. SERVICE ROLE KEY EXPOSED IN SOURCE AND VERCEL
**File:** `.env.local` — Lines 1-6  
**Current:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5Mw0mpu6p4klt5FDZSnCqg_tKny0Uhy
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY_FROM_ENV
```
**Why it matters:** The `.env.local` file is committed to the git repo and uploaded to Vercel. The service role key BYPASSES ALL ROW LEVEL SECURITY, giving anyone who obtains it full admin access to the entire database (read/write all guests, vendors, invoices). The anon key is also exposed in client-side JS at runtime, which is normal — but the service key must NEVER be in a file that could ship to the browser OR be committed.

**Fix:** 
1. Immediately rotate the service role key in Supabase dashboard  
2. Use `SUPABASE_SERVICE_ROLE_KEY` as a Vercel Environment Secret (not in any file)  
3. Add `.env.local` to `.gitignore` (it already is, but verify it's not tracked)  
4. Add a server-only guard in `supabase-admin.ts` that throws if called from client-side code: `if (typeof window !== 'undefined') throw new Error('supabaseAdmin can only be used in Server Components and Route Handlers')`

**Priority:** CRITICAL

---

### C2. ALL API ROUTES USE `supabaseAdmin` (BYPASSES RLS) WITH ZERO AUTH
**Files:**
- `app/api/rsvp/route.ts` (lines 2, 5, 23, 35)  
- `app/api/rsvp/[id]/route.ts` (lines 2, 7)  
- `app/api/invoices/route.ts` (lines 2, 5, 17)  
- `app/api/stats/route.ts` (lines 2, 5, 8, 11)  
- `app/api/vendors/route.ts` (lines 2, 5, 17)  

**Current pattern:** Every single API route uses `supabaseAdmin` (service-role client) for ALL operations — reads, inserts, updates.

**Why it matters:** 
- The RSVP submission endpoint (POST `/api/rsvp`) exposes a public write endpoint with zero authentication. Anyone who discovers the URL can insert arbitrary guests, abuse the system, or attempt injection.
- The PATCH `/api/rsvp/[id]` allows updating ANY guest record with no authentication — `update(body)` blindly applies whatever the request body contains (see C3).
- The admin-only routes (vendors, invoices, stats) have NO authentication layer at all.

**Fix:** Split into two patterns:
- Public routes (RSVP POST) should use `getSupabase()` (anon key + RLS) with proper RLS policies. Remove `supabaseAdmin` from public endpoints.
- Admin routes need actual authentication — either Supabase Auth with admin role check, or a shared secret/token validated on each request, or Next.js middleware that checks auth before route handlers fire.

**Priority:** CRITICAL

---

### C3. MASS ASSIGNMENT VULNERABILITY IN PATCH ENDPOINT
**File:** `app/api/rsvp/[id]/route.ts` — Line 9  
**Current code:** `await supabaseAdmin.from('guests').update(body).eq('id', params.id)`

**Why it matters:** The entire request body is spread directly into the database update without any whitelist validation. A malicious actor could set any column: `is_attending`, `check_in`, `access_code`, `meal_choice`, etc. There's no schema validation, no type checking, no field allowlist.

**Fix:** Destructure only allowed fields:
```typescript
const { is_attending, check_in, meal_choice, guest_meal, dietary } = body
const { data, error } = await supabaseAdmin
  .from('guests')
  .update({ is_attending, check_in, meal_choice, guest_meal, dietary })
  .eq('id', params.id)
  .select().single()
```

**Priority:** CRITICAL

---

### C4. NO AUTHENTICATION ON ADMIN DASHBOARD
**File:** `app/admin/page.tsx` (line 3: `<AdminDashboard />`)  
**Files:** All admin pages and API routes lack any authentication guard.

**Why it matters:** The admin dashboard at `/admin` is completely open. Anyone who discovers the URL can:
- View all guest names, emails, dietary restrictions, phone numbers (PII exposure)
- View all vendor costs, invoices, financial data
- The `Footer` component on the public site (line 22-26 of `footer.tsx`) explicitly links to `/admin` with text "Admin / Wedding Staff Login" — making discovery trivial

**Fix:** Implement a login wall using Supabase Auth (or a simple password gate). Add middleware that checks authentication before rendering `/admin/*` routes.

**Priority:** CRITICAL

---

### C5. `ignoreBuildErrors: true` IN PRODUCTION — SILENT TYPE FAILURES
**File:** `next.config.mjs` — Line 5  
**Current code:** `ignoreBuildErrors: true`

**Why it matters:** This flag tells Next.js to proceed with deployment even when TypeScript compilation fails. Every file in the project has any-typed data mappers (`toGuest(g: any)`, `toVendor(v: any)`), and there are import/type errors that would normally fail the build. This means the deployed site may be running with silently broken code.

**Fix:** Remove `ignoreBuildErrors: true` and fix the actual type errors. Turn on `strict: true` (already in tsconfig but negated by this flag).

**Priority:** CRITICAL

---

## 🟠 HIGH PRIORITY (12)

### H1. `request.json()` PARSED BUT NEVER VALIDATED RELIABLY
**File:** `app/api/vendors/route.ts` — Line 15  
**File:** `app/api/invoices/route.ts` — Line 15  
**Current:** `const body = await request.json()` ... `insert([body])`

**Why it matters:** User-supplied JSON is inserted directly into the database with no schema validation library (Zod, yup, etc.). If `body` contains unexpected fields, they get written to the DB. Missing required fields produce opaque database errors.

**Fix:** Use Zod schemas for all API inputs:
```typescript
import { z } from 'zod'
const vendorSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  contact: z.string().optional(),
  status: z.enum(['pending', 'confirmed']),
  fee: z.number().min(0),
})
const body = vendorSchema.parse(await request.json())
```

**Priority:** HIGH

---

### H2. ACCESS CODE GENERATED CLIENT-SIDE — CAN BE FORGED/SPOOFED
**File:** `components/wedding/rsvp.tsx` — Lines 32-37 and Line 51  
**Current:** `makeAccessCode(name)` generates code on the client, the code is also generated **again** server-side

**Why it matters:** The client generates the same access code format that the server generates in `app/api/rsvp/route.ts` (line 33). If the POST fails, the catch handler (line 68) shows the client-generated code to the user. The server doesn't validate code uniqueness properly before insert (it only checks email uniqueness).

**Fix:** Remove client-side code generation. Let the server be the sole source of truth. Return the access code only from the successful POST response.

**Priority:** HIGH

---

### H3. DUPLICATE ACCESS CODE LOGIC — FRAGILE
**File:** `app/api/rsvp/route.ts` — Lines 33  
**Current:** The format `WED-{LASTNAME}-{6DIGITS}` has only 900k possible values for a surname. A hash collision is possible with ~1000+ guests (birthday paradox).

**Fix:** Use `crypto.randomUUID()` or a longer token (`nanoid(12)` with a custom alphabet). Also add a retry loop if the generated code already exists:
```typescript
const generateUniqueCode = async () => {
  for (let i = 0; i < 5; i++) {
    const code = `WED-${nanoid(8).toUpperCase()}`
    const { data: existing } = await supabaseAdmin.from('guests').select('id').eq('access_code', code).maybeSingle()
    if (!existing) return code
  }
  throw new Error('Unable to generate unique access code')
}
```

**Priority:** HIGH

---

### H4. NO RATE LIMITING ON PUBLIC RSVP ENDPOINT
**File:** `app/api/rsvp/route.ts` — POST handler (lines 14-52)

**Why it matters:** Any anonymous caller can POST unlimited RSVPs. This enables:
- Database flooding / DoS attacks
- Email enumeration (the 409 response tells you if an email already exists)
- Spam guest entries

**Fix:** Add rate limiting. With Vercel: use `@upstash/ratelimit` or the Vercel KV rate-limiting. At minimum: IP-based throttling (max 5 POSTs per IP per minute). Alternatively, implement a CAPTCHA (Turnstile or reCAPTCHA v3) on the RSVP form.

**Priority:** HIGH

---

### H5. ALL `alert()` CALLS — TERRIBLE UX, NO TOAST SYSTEM USED
**Files:**
- `components/wedding/rsvp.tsx` — Lines 63, 65  
- `components/dashboard/pages/rsvps-page.tsx` — Line 88  
- `components/dashboard/pages/vendors-page.tsx` — Line 65  
- `components/dashboard/pages/invoices-page.tsx` — Line 38  

**Current:** `alert("Something went wrong...")` / `alert("Failed to update...")`

**Why it matters:** `alert()` blocks the browser, looks unprofessional, and provides no user feedback that integrates with the app's design. The project already has `sonner` installed for toast notifications but doesn't use it in these cases.

**Fix:** Replace all `alert()` calls with `toast.error()` from `sonner`.

**Priority:** HIGH

---

### H6. SILENT ERROR SWALLOWING IN RSVP CATCH BLOCK
**File:** `components/wedding/rsvp.tsx` — Lines 67-69  
**Current:**
```typescript
} catch {
  setSubmitted({ name, email, guests, meal, guestMeal: guests === "2" ? guestMeal : null, dietary, attendance, code: accessCode })
}
```

**Why it matters:** If the API request fails (network error, server error), the catch block shows the user a "success" screen with a fake access code. The user thinks their RSVP was recorded but it wasn't. This is data loss disguised as success.

**Fix:** Show an error toast with retry option:
```typescript
catch (err) {
  toast.error("Network error. Please try again.", { 
    action: { label: "Retry", onClick: handleSubmit }
  })
}
```

**Priority:** HIGH

---

### H7. `img` INSTEAD OF NEXT `Image` COMPONENT
**Files:**
- `components/wedding/hero.tsx` — Line 11: `<img src="/images/hero-couple.png">`
- `components/wedding/invitation.tsx` — Line 56: `<img src="/images/couple-portrait.png">`

**Why it matters:** Native `<img>` tags miss Next.js optimizations: lazy loading, responsive image sets, WebP/AVIF conversion, blur placeholder, and proper dimension enforcement. Combined with `next.config.mjs` setting `images.unoptimized: true`, ALL images are delivered as full-resolution originals — massive bandwidth waste.

**Fix:** Use `<Image>` from `next/image` with explicit `width`, `height`, `priority` on hero, `placeholder="blur"` with blurDataURL, and remove `unoptimized: true` from next.config.mjs.

**Priority:** HIGH

---

### H8. `images.unoptimized: true` KILLS PERFORMANCE
**File:** `next.config.mjs` — Line 8  
**Current:** `unoptimized: true`

**Why it matters:** This disables all of Next.js's image optimization pipeline. Images are served at original resolution — hero image at full size, never converted to WebP, never resized for mobile. Vercel's image optimization is free on the Pro plan and included in Hobby (with a limit).

**Fix:** Remove this flag. Configure proper `remotePatterns` or `deviceSizes` if needed instead of blanket disabling optimization. If using external image CDN, configure `loader` properly.

**Priority:** HIGH

---

### H9. NO ERROR BOUNDARIES — CASCADING UI FAILURES
**File:** Nowhere in the project

**Why it matters:** If any component throws (e.g., a fetch fails, a null reference), the entire React tree unmounts and shows a white screen. The admin dashboard is particularly vulnerable because every page does `fetch().then(r.json())` with no error boundaries.

**Fix:** Add a global `error.tsx` at the app root, and wrap each admin page section in `<ErrorBoundary fallback={<p>Something went wrong</p>}>`.

**Priority:** HIGH

---

### H10. `any` TYPES EVERYWHERE — DEFEATS TYPESCRIPT
**Files:**
- `components/dashboard/pages/dashboard-page.tsx` — Lines 29-44: `toGuest(g: any)`, `toVendor(v: any)`, `toInvoice(i: any)`
- `components/dashboard/pages/rsvps-page.tsx` — Line 27: `toGuest(g: any)`
- `components/dashboard/pages/vendors-page.tsx` — Line 28: `toVendor(v: any)`
- `components/dashboard/pages/invoices-page.tsx` — Line 15: `toInvoice(i: any)`
- `components/dashboard/catering-dashboard.tsx` — Line 46: `(g: any)`

**Why it matters:** Every API response is typed as `any`, then manually mapped. If the API returns a different shape (column renamed, missing field), the mapper silently produces `undefined` values or crashes at runtime. TypeScript provides zero protection here. Combined with `ignoreBuildErrors: true`, the entire type system is ornamental.

**Fix:** Generate Supabase types from the schema (`supabase gen types typescript --linked > lib/supabase-types.ts`) and use proper typed responses instead of `any`.

**Priority:** HIGH

---

### H11. DARK MODE SWITCH DOES NOTHING
**File:** `components/dashboard/pages/settings-page.tsx` — Line 50  
**Current:** `const [darkMode, setDarkMode] = useState(false)` — never applied to DOM

**Why it matters:** The toggle is cosmetic. Setting it does not change the theme. The app has a full dark mode CSS (`globals.css` line 90-123) and the `next-themes` package is in `package.json`, but neither is wired to this setting. The layout (`app/layout.tsx`) hardcodes `className="light"` on the `<html>` tag.

**Fix:** Remove the dead toggle, or integrate with `next-themes`'s `ThemeProvider`.

**Priority:** HIGH

---

### H12. SIDEBAR DATE MISMATCH WITH WEDDING DATA
**File:** `components/dashboard/sidebar.tsx` — Line 105  
**Current:** `September 14, 2026`  
**Wedding data (`lib/wedding-data.ts` Line 10):** `Saturday, September 26, 2026`

**Why it matters:** The admin sidebar shows the wrong wedding date. This erodes trust for the couple using the dashboard.

**Fix:** Import `wedding.date` from `@/lib/wedding-data` instead of hardcoding.

**Priority:** HIGH

---

## 🟡 MEDIUM PRIORITY (10)

### M1. `formatDate()` APPENDS "T00:00:00" TO AVOID TIMEZONE ISSUE — FRAGILE
**File:** `lib/data.ts` — Line 545  
**Current:** `new Date(iso + "T00:00:00")`

**Why it matters:** Adding `T00:00:00` forces midnight UTC interpretation, but the actual dates from the DB may include times. If the DB returns `2026-08-01T00:00:00+00`, the result is `2026-08-01T00:00:00T00:00:00` which is an invalid date string on some parsers.

**Fix:** Use `new Date(iso)` and let the browser handle timezone. Or use a library like `date-fns` for formatting.

**Priority:** MEDIUM

---

### M2. VENDOR POST ENDPOINT DOESN'T VALIDATE `category` AGAINST ALLOWED LIST
**File:** `app/api/vendors/route.ts` — Lines 14-19

**Why it matters:** The `category` field is inserted directly with no validation against the allowed `VendorCategory` types. A typo like "Cateringg" would write garbage data and silently break UI filtering.

**Fix:** Add Zod validation (see H1 fix).

**Priority:** MEDIUM

---

### M3. RSVP FORM LACKS SUCCESS FEEDBACK FOR DECLINE
**File:** `components/wedding/rsvp.tsx` — Lines 271-277 (decline branch)

**Why it matters:** Code shows a truncated `submitted.name.split(" ")` — likely split on first name display. The decline screen shows "We'll miss you, [first name]!" but there's no confirmation that the RSVP was actually recorded.

**Fix:** Show the same confirmation messaging pattern as acceptance, with a different visual treatment. Make sure the name display doesn't crash for single-name entries.

**Priority:** MEDIUM

---

### M4. NO LOADING STATES ON RSVP SUBMIT BUTTON
**File:** `components/wedding/rsvp.tsx` — Lines 254-259

**Why it matters:** The submit button has no disabled state during submission. Users can double-click and trigger two API calls. There's no spinner or loading indicator.

**Fix:** Add `const [submitting, setSubmitting] = useState(false)`. Disable the button and show a spinner while `submitting` is true. Wrap the POST call: `setSubmitting(true); try { ... } finally { setSubmitting(false) }`.

**Priority:** MEDIUM

---

### M5. `useMemo` FOR PREVIEW BLOCKS IS REDUNDANT
**File:** `components/dashboard/email-builder.tsx` — Line 137  
**Current:** `const previewBlocks = useMemo(() => blocks, [blocks])`

**Why it matters:** `useMemo(() => blocks, [blocks])` is identical to just using `blocks` directly. The entire `blocks` array is recreated on every state change anyway (React state immutability). This adds unnecessary computation and memory overhead.

**Fix:** Remove `useMemo` — use `blocks` directly in the preview component.

**Priority:** MEDIUM

---

### M6. INVOICES PAGE USES `window.alert` FOR DOWNLOAD
**File:** `components/dashboard/pages/invoices-page.tsx` — Line 38  
**Current:** `window.alert(`Downloading ${invoice.number} for ${invoice.vendor}…`)`

**Why it matters:** Hitting "Download" on an invoice shows a browser alert that says "Downloading..." but does nothing else. This is placeholder code that was never replaced. It's deceptive.

**Fix:** Either implement the actual PDF download, replace with a toast indicating the feature is coming soon, or remove the button.

**Priority:** MEDIUM

---

### M7. RSVP FORM HARDCODES PARTY SIZE TO 1 OR 2
**File:** `components/wedding/rsvp.tsx` — Line 154  
**Current:** `{["1", "2"].map((n) => ...)}`

**Why it matters:** The form only supports parties of 1 or 2, but the database schema and data models allow any `guest_count`. A family with children can't RSVP. Also, `guest_meal` is only shown when `guests === "2"`, but a party of 2 could mean the named guest + 1 child who needs the same meal.

**Fix:** Support 1-6 (or more). For parties >1, show a multi-guest meal selector instead of a single "guest meal" field.

**Priority:** MEDIUM

---

### M8. MISSING `<head>` TITLE USES `&amp;` INSTEAD OF `&`
**File:** `app/program/page.tsx` — Line 51  
**File:** `components/wedding/invitation.tsx` — Line 51  
**Current:** `{wedding.brideFirst} &amp; {wedding.groomFirst}` / similar

**Why it matters:** In JSX, `&amp;` renders as literal text `&amp;` instead of an ampersand.

**Fix:** Replace `&amp;` with `&` in JSX expressions.

**Priority:** MEDIUM

---

### M9. `uid()` FUNCTION IS STATE-UNSAFE — BREAKS RE-RENDERS
**File:** `lib/email-types.ts` — Lines 37-38  
**Current:** 
```typescript
let counter = 0
const uid = (seed: string) => `${seed}-${counter++}`
```

**Why it matters:** This uses a module-level mutable counter. When React re-renders, the counter resets to 0 in development (hot reload), causing ID collisions. In strict mode, `counter++` is called twice per component mount.

**Fix:** Use `crypto.randomUUID()` or `nanoid()`:
```typescript
const uid = (seed: string) => `${seed}-${crypto.randomUUID()}`
```

**Priority:** MEDIUM

---

### M10. PROGRAM PAGE USES `window.close()` WHICH DOESN'T WORK FOR MOST BROWSERS
**File:** `components/wedding/program-actions.tsx` — Line 24  
**Current:** `onClick={() => window.close()}`

**Why it matters:** `window.close()` only works for windows opened via `window.open()` — it silently fails for pages the user navigated to directly. The "Close" button on the program page appears to do nothing.

**Fix:** Use `router.back()` or `<Link href="/">Back to Wedding</Link>` instead.

**Priority:** MEDIUM

---

## 🔵 LOW PRIORITY (8)

### L1. `lib/data.ts` MOCK DATA IS NEVER USED BY REAL COMPONENTS
**File:** `lib/data.ts` — Lines 72-402 (guests, vendors, invoices arrays)  
Dead mock data inflates bundle.

### L2. `header.tsx` SEARCH INPUT DOES NOTHING
**File:** `components/dashboard/header.tsx` — Lines 42-49  
Decorative search bar with no implementation. Remove or implement.

### L3. DASHBOARD `check_in` TOGGLE DOESN'T SET `check_in_at` TIMESTAMP
**File:** `components/dashboard/pages/rsvps-page.tsx` — Lines 68-90  
Schema has `check_in_at` column but it's never written.

### L4. SETTINGS PAGE "SAVE CHANGES" BUTTON DOES NOTHING
**File:** `components/dashboard/pages/settings-page.tsx` — Lines 103-105  
No onSubmit handler, no persistence.

### L5. `Gem` IMPORTED BUT REMOVED FROM LUCIDE
**File:** `components/dashboard/sidebar.tsx` — Line 5  
`Gem` was removed from lucide-react. May silently be undefined.

### L6. `shadcn` PACKAGE IN PRODUCTION DEPENDENCIES
**File:** `package.json` — `"shadcn": "^4.8.0"`  
Should be devDependency, not production dependency.

### L7. PRISMA INSTALLED BUT NEVER USED
**File:** `package.json` — `@prisma/client`, `prisma`  
Dead dependencies. Schema is managed via Supabase SQL directly.

### L8. `uid()` GENERATES NON-DETERMINISTIC SSR HYDRATION
**File:** `lib/email-types.ts` — Line 38  
Counter-based IDs cause hydration mismatch if server and client counts differ.

---

## 🟢 ENHANCEMENTS (7)

### E1. ADD TO WALLET — CURRENT .ICS DOWNLOAD WON'T WORK FOR GOOGLE WALLET
**Current approach:** The "Add to Wallet" button triggers `shareToMobile()` which downloads an `.ics` calendar file. This does NOT add to Google/Apple Wallet.

**Best approach:** 
- **Google Wallet:** Use the Google Wallet REST API with `generic` pass type. Requires Google Cloud service account + Wallet issuer account + server-side JWT signing. Free per pass but complex setup.
- **Apple Wallet:** Generate `.pkpass` server-side (requires Apple Wallet Developer certificate + PassKit).
- **Simpler alternative for MVP:** The existing QR code + `.ics` download is usually sufficient for a wedding. Make this an intentional design decision.

### E2. SMS FEATURE — "TEXT ME THE LINK" ARCHITECTURE
**Recommended approach:**
- **Twilio:** Best option. ~$0.0079/SMS US. 500 SMS ≈ $3.95. Send via `@twilio/sdk` in serverless function.
- **Free alternatives:** Amazon SNS (~$0.00645/SMS US), Vonage (~$0.005/SMS)
- **Architecture:** User enters phone → POST to `/api/sms-link` → Twilio sends SMS with wedding link → Rate limit to 1 SMS per phone per 5 min
- **Privacy:** Do NOT store phone number unless user consents

### E3. ADD `aria-live="polite"` REGION
After RSVP submission, announce result to screen readers.

### E4. USE `next/dynamic` FOR RECHARTS
**File:** `components/dashboard/catering-dashboard.tsx`  
Recharts is ~32KB gzipped. Dynamically import it.

### E5. ADD `robots.txt` DISALLOWING `/admin`
Prevent search engine indexing of the admin panel.

### E6. REMOVE UNUSED SHADCN UI COMPONENTS
`progress.tsx`, etc. may not be used.

### E7. QR CODE ON PRINTED INVITATION
Consider adding a QR code on the public page linking to RSVP form for printed invitations.

---

## 📊 STATISTICS

| Category | Count |
|----------|-------|
| Critical | 5 |
| High     | 12 |
| Medium   | 10 |
| Low      | 8 |
| Enhancement | 7 |
| **Total** | **42** |

## 🏆 TOP 5 IMMEDIATE ACTIONS

1. **Rotate the service role key** (C1) — Supabase Dashboard → regenerate  
2. **Add auth to admin routes** (C4) — Supabase Auth + middleware or password gate  
3. **Whitelist PATCH fields** in `/api/rsvp/[id]` (C3)  
4. **Remove `ignoreBuildErrors: true`** (C5) — fix the TypeScript errors  
5. **Replace `supabaseAdmin` with anon client** on public RSVP endpoint (C2)