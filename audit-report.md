# Wedding Website Frontend Audit Report

## Summary

**Project:** `C:\Users\Justin\sites\lynchweddingsite`
**Audited:** 14 component files + 2 config files + CSS
**Severity scale:** CRITICAL (data loss/wrong UX) / HIGH (broken UX) / MEDIUM (accessibility/perf) / LOW (cosmetic/dead code)

---

## 1. CRITICAL — RSVP: `handleSubmit` catch branch shows false success ticket

**File:** `components/wedding/rsvp.tsx`
**Lines:** 67–68

```ts
} catch {
  setSubmitted({ name, email, guests, meal, guestMeal: guests === "2" ? guestMeal : null, dietary, attendance, code: accessCode })
}
```

**Problem:** When the network request fails (Supabase down, 500 error, timeout), the `catch` block renders the **success Ticket** component with a generated access code. The user is told "You're on the list!" — but the RSVP was **never persisted** to the server. This is a data-loss bug: the couple thinks the guest RSVP'd, but the database has no record.

**Fix:** Replace `catch` block with a user-facing error message and a "Try Again" button. Only `setSubmitted` on a confirmed `res.ok`.

```ts
} catch {
  setError("We couldn't submit your RSVP due to a network issue. Please check your connection and try again.")
  // Do NOT show success ticket
}
```

---

## 2. CRITICAL — RSVP: `setTimeout` + `getElementById` for scroll after submit

**File:** `components/wedding/rsvp.tsx`
**Lines:** 70–74

```ts
setTimeout(() => {
  document
    .getElementById("rsvp-result")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}, 100)
```

**Problems:**
1. **Race condition:** 100ms is arbitrary. The `motion.div` with `key="result"` may not be in the DOM yet (React batching + `AnimatePresence` exit animation runs first).
2. **DOM query in React:** `getElementById` is imperative — breaks if the component is used twice.
3. **No cleanup:** If the component unmounts before the timeout fires, it calls `scrollIntoView` on a detached element.

**Fix:** Use a `useEffect` + `useRef`:

```tsx
const resultRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (submitted && resultRef.current) {
    resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}, [submitted])
```

Then attach `ref={resultRef}` to the result div instead of `id="rsvp-result"`.

---

## 3. CRITICAL — Email Builder: `handleSend` is a mock, no email actually sent

**File:** `components/dashboard/email-builder.tsx`
**Lines:** 130–135

```ts
const handleSend = () => {
  toast.success("Email sent successfully!", {
    description: to ? `Delivered to ${to}` : "Your beautiful email is on its way.",
  })
  onSent()
}
```

**Problem:** The entire email builder is a UI mock. "Send" just shows a toast. "Save Draft" (line 160) also shows a toast. No API call is made. The `template` object with `blocks`, `to`, `ccBcc`, `subject` is never serialized or sent anywhere.

**Fix:** Add a real API call to `/api/emails/send` with the full payload. Remove or clearly label as "Preview Mode" if the backend endpoint doesn't exist yet.

---

## 4. HIGH — RSVP: Meal selection uses `<button>` instead of accessible radio group

**File:** `components/wedding/rsvp.tsx`
**Lines:** 182–220

```tsx
{MEAL_OPTIONS.map((option) => (
  <button
    key={option}
    type="button"
    onClick={() => setMeal(option)}
    className={`px-3 py-2 text-sm font-medium border transition-colors ${
      meal === option
        ? "border-primary bg-primary text-primary-foreground"
        : "border-input bg-transparent text-foreground hover:border-primary/50"
    }`}
  >
    {option}
  </button>
))}
```

**Problems:**
1. **No ARIA role:** No `role="radio"`, no `aria-checked`, no `role="radiogroup"` on the container.
2. **Keyboard navigation:** Arrow keys don't navigate between options. Tab focuses each button individually (should be one tab stop for the group).
3. **Screen reader:** No announcement of which option is selected. No `aria-label`.
4. **Inconsistent with attendance section:** The attendance section uses the proper `<RadioGroup>` component from shadcn — the meal section should too.

**Fix:** Replace with `<RadioGroup>`:

```tsx
<RadioGroup
  value={meal}
  onValueChange={(v) => setMeal(v as MealChoice)}
  className="grid grid-cols-3 gap-2 sm:grid-cols-5"
>
  {MEAL_OPTIONS.map((option) => (
    <Label
      key={option}
      className={`flex cursor-pointer items-center justify-center border p-3 text-sm font-medium transition-colors ${
        meal === option
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent text-foreground hover:border-primary/50"
      }`}
    >
      <RadioGroupItem value={option} className="sr-only" />
      {option}
    </Label>
  ))}
</RadioGroup>
```

---

## 5. HIGH — Settings Page: "Save Changes" button has no onClick handler

**File:** `components/dashboard/pages/settings-page.tsx`
**Line:** 104

```tsx
<Button type="button">Save Changes</Button>
```

**Problem:** The button renders but does nothing. No `onClick` handler. Settings (`emailNotifs`, `darkMode`, `weddingDate`) are stored in `useState` only — they reset on every page refresh.

**Fix:** Add an `onClick` that persists to localStorage or a `/api/settings` endpoint:

```tsx
<Button type="button" onClick={handleSave}>Save Changes</Button>
```

```ts
const handleSave = () => {
  localStorage.setItem("wedding-settings", JSON.stringify({ emailNotifs, darkMode, weddingDate }))
  toast.success("Settings saved")
}
```

---

## 6. HIGH — Settings Page: Dark mode toggle does nothing

**File:** `components/dashboard/pages/settings-page.tsx`
**Line:** 50
**File:** `app/layout.tsx`
**Line:** 55

```tsx
// settings-page.tsx
const [darkMode, setDarkMode] = useState(false)

// layout.tsx
<html lang="en" className={`light bg-background ${playfair.variable} ${montserrat.variable}`}>
```

**Problem:** The toggle sets `darkMode` state, but nothing toggles `document.documentElement.classList`. The `<html>` has `className="light"` hardcoded in `layout.tsx`. The `globals.css` has complete `.dark` and `@media (prefers-color-scheme: dark)` blocks — both are dead code because the `light` class is always present.

**Fix:** In `layout.tsx`, remove the hardcoded `light` class. In `settings-page.tsx`, add a `useEffect` that toggles the class:

```tsx
useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode)
}, [darkMode])
```

---

## 7. HIGH — Layout: Hardcoded `colorScheme: 'light'` and `className="light"`

**File:** `app/layout.tsx`
**Lines:** 43, 55

```tsx
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}
```

**Problem:** Forces light mode regardless of OS preference. The `globals.css` has `@media (prefers-color-scheme: dark)` support, but the layout prevents it from ever activating.

**Fix:** Remove the hardcoded `light` class. Use `colorScheme: 'light dark'` to respect OS preference:

```tsx
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}
```

---

## 8. HIGH — Layout: `generator: 'v0.app'` in metadata

**File:** `app/layout.tsx`
**Line:** 22

```tsx
generator: 'v0.app',
```

**Problem:** This is a v0.dev artifact that leaks the tool used to generate the site. Should be removed for production.

---

## 9. HIGH — Hero: Uses `<img>` instead of Next.js `<Image>`

**File:** `components/wedding/hero.tsx`
**Lines:** 11–14

```tsx
<img
  src="/images/hero-couple.png"
  alt={`${wedding.brideFirst} and ${wedding.groomFirst} — wedding photo`}
  className="absolute inset-0 size-full object-cover"
/>
```

**Problems:**
1. **No automatic optimization:** `<Image>` would convert to WebP/AVIF, resize, and serve responsive srcsets.
2. **No lazy loading:** Hero is LCP candidate — should use `priority` prop.
3. **No blur placeholder:** `<Image>` supports `placeholder="blur"` with `blurDataURL`.
4. **No fetchpriority:** Can't signal `fetchpriority="high"` to the browser.

**Fix:** Replace with `<Image>`:

```tsx
import Image from "next/image"

<Image
  src="/images/hero-couple.png"
  alt={`${wedding.brideFirst} and ${wedding.groomFirst} — wedding photo`}
  fill
  className="object-cover"
  priority
  sizes="100vw"
  placeholder="blur" // requires static import or blurDataURL
/>
```

---

## 10. HIGH — Invitation: Uses `<img>` instead of `<Image>`

**File:** `components/wedding/invitation.tsx`
**Lines:** 56–59

Same issue as #9. Use `<Image>` with `width`, `height`, and `sizes`.

---

## 11. HIGH — Dashboard Page: No loading state, no error handling

**File:** `components/dashboard/pages/dashboard-page.tsx`
**Lines:** 52–67

```tsx
useEffect(() => {
  Promise.all([
    fetch("/api/rsvp").then(r => r.json()),
    fetch("/api/vendors").then(r => r.json()),
    fetch("/api/invoices").then(r => r.json()),
  ]).then(([g, v, i]) => {
    // ...
  })
}, [])
```

**Problems:**
1. **No `loading` state:** The page renders immediately with empty arrays. No skeleton or spinner.
2. **No error handling:** If any fetch fails, the `.then()` never executes. State stays as empty arrays. User sees "0 RSVPs, 0 vendors, 0 invoices" with no indication of failure.
3. **Unhandled promise rejection:** The `.catch()` is missing entirely.
4. **No `AbortController`:** If the component unmounts, the fetch continues and calls `setState` on unmounted component.

**Fix:**

```tsx
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const controller = new AbortController()
  setLoading(true)
  setError(null)

  Promise.all([
    fetch("/api/rsvp", { signal: controller.signal }).then(r => {
      if (!r.ok) throw new Error("Failed to fetch RSVPs")
      return r.json()
    }),
    // ...
  ])
    .then(([g, v, i]) => {
      // ... set state
      setLoading(false)
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        setError(err.message)
        setLoading(false)
      }
    })

  return () => controller.abort()
}, [])
```

---

## 12. HIGH — Catering Dashboard: No error handling, fetch failure hangs forever

**File:** `components/dashboard/catering-dashboard.tsx`
**Lines:** 38–61

```tsx
useEffect(() => {
  Promise.all([
    fetch("/api/rsvp").then(r => r.json()),
  ]).then(([guests]) => {
    // ...
    setLoading(false)
  })
}, [])
```

**Problem:** If the fetch fails, `setLoading(false)` is never called. The user sees "Loading catering data..." **forever**. No error state, no retry mechanism.

**Fix:** Same as #11 — add `.catch()` with `setError()`, return a meaningful error UI.

---

## 13. MEDIUM — Itinerary: Hover-only popover doesn't work on touch devices

**File:** `components/wedding/itinerary.tsx`
**Lines:** 85–86, 93–94

```tsx
onMouseEnter={() => setActive(i)}
onMouseLeave={() => setActive((prev) => (prev === i ? null : prev))}
```

**Problems:**
1. **Touch devices:** `onMouseEnter`/`onMouseLeave` don't fire on mobile/tablet. The popover can never be opened on touch.
2. **Keyboard users:** The `onFocus`/`onBlur` handlers exist (lines 93–94), but `onBlur` closes the popover when focus leaves the button — and the popover content is **not focusable**, so a keyboard user can never read the content.
3. **`role="dialog"` without `aria-modal`:** The `EventPopover` has `role="dialog"` but no `aria-modal="true"` and no focus trap — keyboard focus can escape the dialog.

**Fix:** Make the popover toggleable via `onClick` (click-to-open, click-to-close) in addition to hover. Make the popover content focusable:

```tsx
onClick={() => setActive((prev) => (prev === i ? null : i))}
```

And in `EventPopover`:
```tsx
<motion.div
  role="dialog"
  aria-modal="true"
  aria-label={`${event.title} details`}
  tabIndex={0}  // make focusable
  onKeyDown={(e) => { if (e.key === "Escape") onClose() }}
>
```

---

## 14. MEDIUM — Itinerary: Popover position can overflow viewport on mobile

**File:** `components/wedding/itinerary.tsx`
**Line:** 18

```tsx
className="absolute left-16 top-0 z-30 w-72 origin-top-left md:left-auto md:right-full md:mr-6 md:origin-top-right"
```

**Problem:** On mobile (<768px), the popover is positioned at `left-16` (4rem) with a fixed `w-72` (18rem). On a 375px-wide phone, this leaves only ~6rem of space. The content will overflow the right edge of the viewport.

**Fix:** Use a responsive width (`w-64 sm:w-72`) and add a right boundary with `max-w-[calc(100vw-2rem)]`. Better yet, use a `<Popover>` component from shadcn that handles flip/overflow natively.

---

## 15. MEDIUM — RSVP: No loading/submitting state on form

**File:** `components/wedding/rsvp.tsx`
**Lines:** 49–75

**Problem:** The submit button has no disabled state during submission. A user can click "Submit RSVP" multiple times, triggering multiple `fetch` calls and potentially creating duplicate RSVPs.

**Fix:** Add `submitting` state:

```tsx
const [submitting, setSubmitting] = useState(false)

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setSubmitting(true)
  try {
    // ... fetch
  } catch {
    setError("...")
  } finally {
    setSubmitting(false)
  }
}

// Button:
<Button type="submit" disabled={submitting} size="lg" ...>
  {submitting ? "Submitting..." : "Submit RSVP"}
</Button>
```

---

## 16. MEDIUM — RSVP: `makeAccessCode` uses insecure `Math.random()`

**File:** `components/wedding/rsvp.tsx`
**Lines:** 32–37

```ts
function makeAccessCode(name: string) {
  const last = name.trim().split(/\s+/).pop() ?? "GUEST"
  const surname = last.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "GUEST"
  const digits = Math.floor(100000 + Math.random() * 900000)
  return `WED-${surname}-${digits}`
}
```

**Problems:**
1. `Math.random()` is not cryptographically secure. For access codes, use `crypto.randomUUID()` or `crypto.getRandomValues()`.
2. The access code is generated client-side — the server should be the source of truth. The code generated here may differ from what the server generates.
3. Collision risk: With 900k possible values and real `Math.random()`, collisions are possible with many guests.

**Fix:** Use `crypto.randomUUID()` and let the server return the official code:

```ts
const digits = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000
```

---

## 17. MEDIUM — RSVP: `generateICS` has hardcoded date

**File:** `components/wedding/rsvp.tsx`
**Line:** 301

```ts
const dateStr = "20260926"
```

**Problem:** The date is hardcoded rather than derived from `wedding.date`. If the wedding date changes, the ICS file becomes wrong.

**Fix:** Parse the date from the wedding data:

```ts
const dateParts = wedding.date.match(/(\d{4})/) ?? []
const dateStr = "20260926" // TODO: parse from wedding.date
```

---

## 18. MEDIUM — RSVP: `shareToMobile` swallows errors silently

**File:** `components/wedding/rsvp.tsx`
**Line:** 385

```ts
navigator.share({...}).catch(() => addToWallet(data))
```

**Problem:** If both `navigator.share` fails AND `addToWallet` fails, the user gets no feedback. The `.catch` is silent.

**Fix:** Add a toast or error state:

```ts
.catch((err) => {
  addToWallet(data)
  toast.error("Could not share. Downloaded ticket file instead.")
})
```

---

## 19. MEDIUM — Globals.css: `.dark` block and `@media (prefers-color-scheme: dark)` are dead code

**File:** `app/globals.css`
**Lines:** 90–160

**Problem:** Since `layout.tsx` hardcodes `className="light"` and `colorScheme: 'light'`, both the `.dark` class-based block (lines 90–123) and the `@media (prefers-color-scheme: dark)` block (lines 125–160) are **never applied**. They contribute ~2KB of dead CSS.

**Fix:** Either remove the dead code, or fix the layout to respect dark mode (see Issue #6, #7).

---

## 20. MEDIUM — Globals.css: No `@media (prefers-reduced-motion: reduce)`

**File:** `app/globals.css`

**Problem:** The site uses `motion/react` for animations (hero, itinerary popovers, RSVP transitions, reveal animations). There's no `prefers-reduced-motion` support, which can cause vestibular issues for users with motion sensitivity.

**Fix:** Add:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 21. MEDIUM — Hero: No fallback if image fails to load

**File:** `components/wedding/hero.tsx`
**Lines:** 11–14

**Problem:** If `hero-couple.png` fails to load (network error, wrong path), the hero shows a blank section with black overlays. No fallback text or gradient.

**Fix:** Use `onError` on the `<Image>` (or `<img>`) to render a fallback:

```tsx
const [imgError, setImgError] = useState(false)

// ...
{imgError ? (
  <div className="absolute inset-0 bg-gradient-to-br from-hunter to-primary" />
) : (
  <Image ... onError={() => setImgError(true)} />
)}
```

---

## 22. LOW — RSVP: `phone: ""` sent as dead payload

**File:** `components/wedding/rsvp.tsx`
**Line:** 56

```ts
body: JSON.stringify({ name, email, phone: "", ... })
```

**Problem:** The form has no phone input, but `phone: ""` is always sent. This is dead code in the API payload.

---

## 23. LOW — Layout: Inline styles for background color on `<html>` and `<body>`

**File:** `app/layout.tsx`
**Lines:** 56, 58

```tsx
<html ... style={{ backgroundColor: '#fafafa' }}>
<body ... style={{ backgroundColor: '#fafafa' }}>
```

**Problem:** Inline styles prevent CSS override and don't respect dark mode. The `globals.css` already sets `background-color` via Tailwind classes on `body`.

---

## 24. LOW — Dashboard Page: `initials()` function strips `&` from names

**File:** `components/dashboard/pages/dashboard-page.tsx`
**Line:** 20

```ts
.replace(/&.*/, "")
```

**Problem:** If a guest name is "John & Jane Smith", this strips everything after `&`, so the initials would be `JO` instead of `JS`.

---

## 25. LOW — Settings Page: `Field` and `FieldLabel` components may not exist

**File:** `components/dashboard/pages/settings-page.tsx`
**Line:** 15

```tsx
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
```

**Problem:** These components are imported but may not exist in the `components/ui/field` path. The `FieldGroup` wrapping is unnecessary if the imports are missing.

---

## 26. LOW — No structured data (JSON-LD) for wedding event

**File:** `app/layout.tsx` (or page-level)

**Problem:** No schema.org `Event` structured data is included. This reduces SEO visibility for the wedding.

**Fix:** Add `JSON-LD`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${wedding.brideFirst} & ${wedding.groomFirst} Wedding`,
      startDate: "2026-09-26T16:00",
      location: {
        "@type": "Place",
        name: wedding.ceremonyVenue,
        address: wedding.ceremonyAddress,
      },
    }),
  }}
/>
```

---

## 27. LOW — Program page: `Image` component with `aria-hidden` but no `alt=""`

**File:** `app/program/page.tsx`
**Line:** 42–48

```tsx
<Image
  src="/images/botanical-crest.png"
  alt=""
  width={160}
  height={160}
  aria-hidden="true"
/>
```

**Problem:** `alt=""` already marks it as decorative. Adding `aria-hidden="true"` is redundant. This is minor but inconsistent.

---

## 28. LOW — RSVP: No email format validation

**File:** `components/wedding/rsvp.tsx`
**Line:** 134

```tsx
<Input
  id="email"
  type="email"
  required
```

**Problem:** The `type="email"` attribute provides basic browser validation, but no custom validation (e.g., for specific domains, or multi-email format). The `pattern` attribute could add server-side matching.

---

## 29. LOW — RSVP: Attendance `<Label>` wraps `<RadioGroupItem>` non-standard

**File:** `components/wedding/rsvp.tsx`
**Lines:** 237–249

```tsx
<Label className="flex cursor-pointer items-center gap-3 border p-4 ...">
  <RadioGroupItem value={opt.value} />
  <span>{opt.label}</span>
</Label>
```

**Problem:** The standard shadcn pattern is `RadioGroupItem` + `Label` with `htmlFor`/`id`. Wrapping `RadioGroupItem` inside `<Label>` works but is non-standard and may cause double-click issues in some browsers.

---

## 30. LOW — `data.ts` import in dashboard-page has unused types

**File:** `components/dashboard/pages/dashboard-page.tsx`
**Line:** 15

```tsx
import { formatDate, type Guest, type Vendor, type Invoice, type VendorDeadline } from "@/lib/data"
```

**Problem:** `formatDate` is used, but `Guest`, `Vendor`, `Invoice`, `VendorDeadline` are only used as type annotations on the mapping functions. If the `toGuest`/`toVendor`/`toInvoice`/`toDeadline` functions are typed correctly, these imports are fine.

---

## 31. LOW — Catering Dashboard loading state is just text

**File:** `components/dashboard/catering-dashboard.tsx`
**Lines:** 75–81

```tsx
if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-serif text-lg text-muted-foreground">Loading catering data...</p>
    </div>
  )
}
```

**Problem:** Just text "Loading catering data..." — no skeleton, no spinner, no progress indicator. On slow connections, the user sees just a blank page with text.

---

## 32. LOW — No error boundaries anywhere

**Problem:** None of the pages or components are wrapped in React error boundaries. If any component throws during rendering, the entire page shows a white screen with no recovery option.

**Fix:** Create a reusable `<ErrorBoundary>` component and wrap each page section.

---

## Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | **CRITICAL** | rsvp.tsx:67-68 | Catch block shows false success ticket |
| 2 | **CRITICAL** | rsvp.tsx:70-74 | Fragile setTimeout + getElementById scroll |
| 3 | **CRITICAL** | email-builder.tsx:130-135 | Email "Send" is a mock |
| 4 | HIGH | rsvp.tsx:182-220 | Meal buttons not accessible radio group |
| 5 | HIGH | settings-page.tsx:104 | Save Changes button does nothing |
| 6 | HIGH | settings-page.tsx:50, layout.tsx:55 | Dark mode toggle is dead code |
| 7 | HIGH | layout.tsx:43,55 | Hardcoded light mode, no OS dark mode |
| 8 | HIGH | layout.tsx:22 | `generator: 'v0.app'` artifact |
| 9 | HIGH | hero.tsx:11-14 | `<img>` not `<Image>` — no optimization |
| 10 | HIGH | invitation.tsx:56-59 | `<img>` not `<Image>` |
| 11 | HIGH | dashboard-page.tsx:52-67 | No loading/error state, no AbortController |
| 12 | HIGH | catering-dashboard.tsx:38-61 | Fetch failure hangs forever |
| 13 | MEDIUM | itinerary.tsx:85-86 | Hover-only popover, no touch support |
| 14 | MEDIUM | itinerary.tsx:18 | Popover overflows on mobile |
| 15 | MEDIUM | rsvp.tsx:49-75 | No submitting/disabled state on form |
| 16 | MEDIUM | rsvp.tsx:32-37 | `Math.random()` for access codes |
| 17 | MEDIUM | rsvp.tsx:301 | Hardcoded ICS date |
| 18 | MEDIUM | rsvp.tsx:385 | Silent error swallowing |
| 19 | MEDIUM | globals.css:90-160 | Dead dark mode CSS |
| 20 | MEDIUM | globals.css | No `prefers-reduced-motion` |
| 21 | MEDIUM | hero.tsx:11-14 | No image load fallback |
| 22 | LOW | rsvp.tsx:56 | Dead `phone: ""` payload |
| 23 | LOW | layout.tsx:56,58 | Inline background styles |
| 24 | LOW | dashboard-page.tsx:20 | `initials()` strips `&` from names |
| 25 | LOW | settings-page.tsx:15 | Possible missing `field` imports |
| 26 | LOW | layout.tsx | No JSON-LD structured data |
| 27 | LOW | program/page.tsx:42-48 | Redundant `aria-hidden` |
| 28 | LOW | rsvp.tsx:134 | No custom email validation |
| 29 | LOW | rsvp.tsx:237-249 | Non-standard Label wrapping |
| 30 | LOW | dashboard-page.tsx:15 | Possibly unused type imports |
| 31 | LOW | catering-dashboard.tsx:75-81 | Text-only loading state |
| 32 | LOW | globals | No error boundaries anywhere |

---

## Recommendations by Priority

### Immediate (CRITICAL)
1. Fix RSVP catch block — do NOT show success ticket on network failure
2. Fix scrollIntoView with useRef + useEffect
3. Either implement real email sending or remove/mark as preview

### Sprint 1 (HIGH)
4. Replace meal `<button>` with `<RadioGroup>`
5. Wire up Settings save button
6. Fix dark mode (remove hardcoded `light` class, add toggle)
7. Replace `<img>` with `<Image>` in hero and invitation
8. Add error handling + loading states to all dashboard pages
9. Add AbortController to all fetch effects

### Sprint 2 (MEDIUM)
10. Fix itinerary popover for touch/keyboard
11. Add submitting state to RSVP form
12. Use `crypto.randomUUID()` for access codes
13. Parse ICS date from wedding data
14. Add `prefers-reduced-motion` support
15. Clean up dead CSS

### Backlog (LOW)
16. Remove `v0.app` generator tag
17. Add JSON-LD structured data
18. Add error boundaries
19. Add loading skeletons
20. Add toast/notification system