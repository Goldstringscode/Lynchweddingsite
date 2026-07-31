# 🔴 COMPREHENSIVE AUDIT REPORT — lynchweddingsite

**Date:** July 29, 2026
**Auditors:** 3 parallel subagents (Backend/Security, Frontend/UI, Code Quality) + cross-check
**Files analyzed:** 75+ source files
**Previous audit:** AUDIT-SUMMARY.md (42 issues, 5 Critical)
**New issues found:** 35+ (8 new Critical, 12 High, 8 Medium, 7 Low/Enhancement)

---

## 🔴 CRITICAL ISSUES (10)

### C1. SERVICE ROLE KEY EXPOSED IN GIT-TRACKED FILES (NEW — WORSE)
**Audit source:** Backend, Code Quality
**Files:** `PIPELINE.md` line 24, `AUDIT-SUMMARY.md` line 16
**Current:** Both files contain the full `SUPABASE_SERVICE_ROLE_KEY` in plaintext. Both are `git ls-files` tracked.
**Fix:** 
1. **Immediately rotate** the service role key in Supabase dashboard
2. Remove secrets from both markdown files
3. Use `git filter-branch` to purge from history if pushed to GitHub
4. Add PIPELINE.md and AUDIT-SUMMARY.md to `.gitignore` or add a `.gitattributes` pattern

### C2. ADMIN PASSWORD EXPOSED IN GIT-TRACKED FILE (NEW)
**Audit source:** Backend
**File:** `PIPELINE.md` line 16
**Current:** `| **Admin password** | \`JNLynch26\` |` — in git-tracked markdown
**Fix:** Change the password, remove from file, store only as Vercel env secret

### C3. FRED API KEY HARDCODED IN SOURCE CODE (NEW)
**Audit source:** Backend
**File:** `app/api/inflation/route.ts` line 3
**Current:** `const FRED_API_KEY = process.env.FRED_API_KEY || "02d615c1d8d5affe828a227cedb408d2"`
**Fix:** Remove the fallback string. Throw if env var is missing.

### C4. DB-MIGRATE ENDPOINT — UNRESTRICTED SQL EXECUTION (NEW)
**Audit source:** Backend
**File:** `app/api/db-migrate/route.ts` lines 1-38
**Current:** A GET endpoint with ZERO auth that executes arbitrary SQL via `exec_sql` RPC and falls back to raw REST API calls exposing the service role key in the Authorization header.
**Fix:** Remove this route entirely (it's a dev debug tool). If it must exist, add admin auth and restrict to POST.

### C5. ALL API ROUTES USE supabaseAdmin WITH ZERO AUTH (CONFIRMED — STILL OPEN)
**Audit source:** Backend
**Files:** All 13 API route files import and use `supabaseAdmin` (service-role client)
**Status:** Still open from previous audit. Every route bypasses RLS with no authentication.
**Fix:** Split into public routes (anon key + RLS) and admin routes (session auth + service role).

### C6. MIDDLEWARE AUTH SKIPS ALL API ROUTES (NEW — PREVIOUSLY MISSED)
**Audit source:** Backend
**File:** `middleware.ts` lines 13-14
**Current:** Middleware checks cookie for `/admin` path, but the actual admin DATA routes (`/api/vendors`, `/api/invoices`, `/api/rsvp`, etc.) are NOT under `/api/admin/` — they're under `/api/`. The middleware's auth guard protects nothing.
**Fix:** Either restructure routes to `/api/admin/*` or add auth checks in each route handler.

### C7. `ignoreBuildErrors: true` STILL ENABLED (CONFIRMED — STILL OPEN)
**Audit source:** Backend, Code Quality
**File:** `next.config.mjs` lines 4-6
**Status:** Still open. TypeScript type checking is completely disabled in production builds.
**Fix:** Remove the block and fix actual type errors.

### C8. MASS ASSIGNMENT IN MENU PUT / DRAFTS PUT (PARTIALLY FIXED)
**Audit source:** Backend
**Files:** `app/api/menu/route.ts` lines 39-68, `app/api/menu/drafts/route.ts` lines 43-70
**Status:** rsvp/[id] was fixed (uses sanitizeFields), but menu PUT and drafts PUT still use `Record<string, any>` with no field validation.
**Fix:** Apply `sanitizeFields()` or Zod validation to all PUT handlers.

### C9. SONNER `<Toaster />` NEVER RENDERED (NEW)
**Audit source:** Frontend
**File:** `app/layout.tsx` — missing `<Toaster />` component
**Details:** Sonner is installed and `toast.*()` is called in `email-builder.tsx`, but the global `<Toaster />` that renders toast notifications is never added to any layout. **All toast calls are invisible.**
**Fix:** Add `import { Toaster } from "@/components/ui/sonner"` and render `<Toaster />` in the root layout.

### C10. `uid()` COUNTER CAUSES SSR HYDRATION MISMATCH (NEW)
**Audit source:** Code Quality
**File:** `lib/email-types.ts` lines 37-38
**Current:** `let counter = 0; const uid = (seed) => \`${seed}-${counter++}\``
**Details:** Module-level mutable counter. Server and client generate different IDs, causing React hydration mismatches. Templates generate different IDs on every render.
**Fix:** Replace with `crypto.randomUUID()` or `nanoid()`.

---

## 🟠 HIGH PRIORITY (14)

### H1. No rate limiting on public RSVP endpoint
**Audit:** Backend — `app/api/rsvp/route.ts` POST
**Fix:** Add IP-based rate limiting (Upstash/Vercel KV)

### H2. No try/catch around `request.json()` on 4 routes
**Audit:** Backend — rsvp, rsvp/[id], invoices, vendors routes
**Fix:** Wrap in try/catch

### H3. RSVP email enumeration vulnerability
**Audit:** Backend — `app/api/rsvp/route.ts` returns 409 when email exists
**Fix:** Return generic 200 for duplicate

### H4. Predictable RSVP access codes
**Audit:** Backend — `app/api/rsvp/route.ts` line 33
**Fix:** Use `crypto.randomUUID()` or `nanoid()`

### H5. Silent error swallowing in menu compare
**Audit:** Backend — `app/api/menu/compare/route.ts` lines 114-122
**Fix:** Log errors, include warning in response

### H6. No validation on menu price/sort_order
**Audit:** Backend — `app/api/menu/route.ts` POST/PUT
**Fix:** Add type/range validation

### H7. No auth on checklist, drafts, stats APIs
**Audit:** Backend — checklist, drafts, stats routes
**Fix:** Add session validation

### H8. `images.unoptimized: true` kills performance
**Audit:** Backend, Code Quality — `next.config.mjs`
**Fix:** Remove flag

### H9. 5 `alert()` calls instead of sonner toasts
**Audit:** Frontend — rsvp.tsx, invoices-page.tsx, vendors-page.tsx, rsvps-page.tsx
**Fix:** Replace with `toast.error()`

### H10. 2 `<img>` tags instead of `next/Image`
**Audit:** Frontend — hero.tsx (LCP), invitation.tsx
**Fix:** Replace with `next/Image` + `priority` on hero

### H11. Sidebar hardcodes wrong date (Sept 14 instead of Sept 26)
**Audit:** Frontend — sidebar.tsx line 105, settings-page.tsx line 51
**Fix:** Import from `wedding-date`

### H12. Dark mode toggle does nothing
**Audit:** Frontend — settings-page.tsx lines 50, 71-77
**Fix:** Either implement or remove the toggle

### H13. Hero scroll link `href="#details"` targets missing element
**Audit:** Frontend — hero.tsx line 65
**Fix:** Change to `#invitation` or add `id="details"`

### H14. Unused Prisma / @prisma/client dependencies
**Audit:** Code Quality — package.json lines 16, 42
**Fix:** Remove both + delete dead npm scripts

---

## 🟡 MEDIUM PRIORITY (8)

### M1. RSVP GET returns all guest PII with no auth
**Audit:** Backend — `app/api/rsvp/route.ts` GET

### M2. Admin login uses plaintext password comparison
**Audit:** Backend — `app/api/admin/login/route.ts` line 14

### M3. Admin login cookie path scoped to /admin (can't protect API routes)
**Audit:** Backend — `app/api/admin/login/route.ts` lines 20-26

### M4. No CORS headers on any API route
**Audit:** Backend — all API routes

### M5. Missing loading states on 4 dashboard pages
**Audit:** Frontend — DashboardPage, VendorsPage, InvoicesPage, RsvpsPage

### M6. Missing empty states on VendorsPage, InvoicesPage
**Audit:** Frontend — vendors, invoices dashboard pages

### M7. Non-functional search input in header.tsx
**Audit:** Frontend, Code Quality — header.tsx lines 50-58

### M8. Dead `components/ui/progress.tsx` component
**Audit:** Code Quality — never imported anywhere

---

## 🔵 LOW PRIORITY (7)

### L1. No Zod validation library in use
**Audit:** Backend, Code Quality

### L2. Checklist GET — full table scan, no pagination
**Audit:** Backend

### L3. Stats endpoint — sequential queries instead of parallel
**Audit:** Backend

### L4. Dead `.dark` CSS block in globals.css (~70 lines)
**Audit:** Frontend

### L5. `shadcn` in production dependencies (should be dev)
**Audit:** Code Quality

### L6. Hardcoded `WEDDING_CODE` in client-side menu-builder page
**Audit:** Code Quality

### L7. Hardcoded registry URL in wedding-data
**Audit:** Code Quality

---

## 🟢 ENHANCEMENTS / FEATURE SUGGESTIONS

### Wedding Platform Features (from FEATURE_BRAINSTORM.md + new)

| Feature | Est. Effort | Value | Why It Matters |
|---------|-----------|-------|----------------|
| **PWA installability** | 2-3 days | High | Guests get app icon on home screen |
| **QR check-in at venue** | 2 days | High | No clipboard guest list, live check-in |
| **Automated RSVP reminders** | 2-3 days | High | Stop chasing guests manually |
| **Digital guest book** | 4-6 days | High | Voice/video messages as keepsake |
| **Live photo feed on screens** | 4-5 days | High | Signature wow moment at reception |
| **NFC place cards** | 3-4 days + hardware | High | Tap phone → table info, personal welcome |
| **Emergency broadcast SMS** | 3-4 days | Medium | Single button reaches all guests |
| **Collaborative Spotify playlist** | 4-6 days | Medium | Guest song suggestions for DJ |
| **Weather forecast widget** | 3 hours | Medium | Help guests plan attire |
| **Hotels & accommodation** | 3-4 hours | Medium | Essential for out-of-town guests |
| **Countdown timer in hero** | 2 hours | Low | Simple engagement boost |
| **Outfit color palette guide** | 1-2 hours | Low | Help guests follow Black Tie dress code |

### Admin Improvements

| Feature | Est. Effort | Why |
|---------|-----------|-----|
| **Guest list CSV export** | 2-3 hours | Caterer needs it |
| **Dietary summary for caterer** | 3-4 hours | Printable report grouped by meal |
| **Budget tracker** | 4-6 hours | Most requested admin tool |
| **Vendor payment tracker** | 4-6 hours | Track deposits, balances |
| **Wedding checklist** | 4-6 hours | 50+ pre-populated tasks |
| **Admin activity log** | 3-4 hours | Audit trail |

### Menu Builder Improvements

| Feature | Est. Effort | Why |
|---------|-----------|-----|
| **Menu items need active/draft status** | 2-3 hours | Catalog shows all items, not just active |
| **Add item images** | 4-6 hours | Visual menu builder |
| **Drag-and-drop course ordering** | 4-6 hours | Better UX than course_number increment |
| **Cost projection per guest count** | 2-3 hours | Scale ingredient costs dynamically |
| **Wine/beverage pairing suggestions** | 3-4 hours | Upsell feature |

---

## 📊 VERDICT

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 10 | 8 new, 2 still open from previous |
| 🟠 High | 14 | 6 new, 8 still open |
| 🟡 Medium | 8 | 4 new, 4 still open |
| 🔵 Low | 7 | 3 new, 4 still open |
| 🟢 Enhancement | 18+ | Feature suggestions |

**Previous audit issues fixed:** 1 of 5 Critical (partial mass assignment fix on rsvp/[id]).
**Total unfixed issues:** 39 (10 Critical, 14 High, 8 Medium, 7 Low)

### Top 5 Actions to Take Right Now

1. **Rotate Supabase service role key** and remove from PIPELINE.md / AUDIT-SUMMARY.md
2. **Remove hardcoded FRED API key** from inflation route
3. **Delete or lock down db-migrate route** — it's an open SQL injection vector
4. **Add `<Toaster />` to root layout** — sonner toasts are invisible without it
5. **Remove `ignoreBuildErrors: true`** and fix the underlying type errors