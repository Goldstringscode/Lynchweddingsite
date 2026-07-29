# Master Roadmap — Nikkita & Justin's Wedding Website

**Live at:** https://lynchweddingsite.vercel.app
**Wedding:** Saturday, September 26, 2026 · Four Seasons at Terra Lago, Indio, CA
**Last updated:** July 29, 2026

---

## ✅ COMPLETED (Deployed Live)

### Critical Fixes
- [x] RSVP API now respects `is_attending` (declining guests work correctly)
- [x] Access codes match between frontend (`WED-SURNAME-XXXXXX`) and database
- [x] Dietary restrictions saved to database (column added + API field)
- [x] Duplicate email shows friendly error instead of 500 crash
- [x] Font CSS corrected (`--font-montserrat` instead of `--font-inter`)
- [x] Vendors page now POSTs to API (not just local state)
- [x] Check-in toggle now PATCHes to database (not just local state)
- [x] RSVP errors show alert instead of fake success screen
- [x] Dietary column added to `guests` table in Supabase

### Audit Reports Saved
- [x] `audit-report.md` — 32 frontend issues (line-by-line)
- [x] `AUDIT-SUMMARY.md` — 42 cross-cutting issues (security, API, DB, UX)
- [x] `FEATURE_BRAINSTORM.md` — 50+ feature ideas + 8-week roadmap

---

## 🟢 CAN DO NOW (No Domain Needed)

These require zero paid services and zero domain setup. Ready to build tonight/tomorrow.

### Critical Security (1-2 days)
| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 1 | **Admin authentication** — login page + Supabase Auth | 6-8h | Email/password or Google OAuth. Protect `/admin/*` routes |
| 2 | **Fix mass assignment** — whitelist PATCH fields | 30min | Only allow `check_in` in `PATCH /api/rsvp/[id]` |
| 3 | **Remove email UNIQUE constraint** — couples sharing email can RSVP | 30min | Run SQL migration, remove duplicate check from API |
| 4 | **Add Zod input validation** — all API routes | 2-3h | Validate request body shape before processing |
| 5 | **Add rate limiting** — public RSVP endpoint | 1h | Prevent spam submissions |
| 6 | **Swap service-role key for anon key** on public RSVP endpoint | 1h | Add RLS policies instead of bypassing security |

### Guest Features (Quick Wins)
| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 7 | **Countdown timer** in hero section | 2h | Days/hours/minutes/seconds to ceremony |
| 8 | **Guest book / well-wishes wall** | 4-6h | Scrollable messages after RSVP, admin approval |
| 9 | **Hotels & accommodation section** | 3-4h | Curated list + Google Maps embed + booking links |
| 10 | **Weather forecast widget** | 3h | 7-day forecast for Indio, CA (free OpenWeatherMap API) |
| 11 | **PWA / Add to Home Screen** | 2-3h | manifest.json, service worker, offline support |
| 12 | **Outfit color palette guide** | 1-2h | Visual style guide for Black Tie dress code |
| 13 | **Local attractions guide** | 2-3h | Restaurants, coffee shops, hiking for out-of-town guests |

### Admin Features
| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 14 | **Guest list CSV export** | 2-3h | `GET /api/rsvp/export` → downloadable CSV |
| 15 | **Dietary summary for caterer** | 3-4h | Printable report grouped by meal choice |
| 16 | **Budget tracker** (planned vs actual) | 4-6h | New `budget_items` table, visual charts |
| 17 | **Vendor payment tracker** | 4-6h | Track deposits, milestones, remaining balance |
| 18 | **Wedding checklist / task tracker** | 4-6h | Pre-populated with 50+ common wedding tasks |
| 19 | **Admin activity log** | 3-4h | Audit trail of who did what |
| 20 | **Emergency contacts page** | 2-3h | One-tap call buttons for venue, caterer, etc. |
| 21 | **Add Invoice functionality** | 2-3h | Add new invoices from admin panel |
| 22 | **Delete/edit guests & vendors** | 3-4h | Add delete/edit buttons to admin tables |

### UX Improvements
| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 23 | **Replace `alert()` with toast notifications** | 2h | `sonner` is already installed but never used |
| 24 | **Add loading states** to all admin pages | 2h | Skeleton loading while data fetches |
| 25 | **Add error boundaries** | 1h | Catch React errors gracefully |
| 26 | **Add empty states** to tables | 1h | "No guests yet" message instead of blank table |
| 27 | **Fix setTimeout scroll** in RSVP form | 30min | Replace with `ref` + `scrollIntoView` with cleanup |
| 28 | **Fix meal selection accessibility** | 1h | Replace buttons with accessible RadioGroup |
| 29 | **Fix itinerary hover-only modals** | 1h | Add touch support for mobile |
| 30 | **Fix `<img>` to `<Image>`** in hero + invitation | 1h | Use Next.js optimized images |
| 31 | **Remove `generator: 'v0.app'` from metadata** | 5min | Production metadata artifact |
| 32 | **Remove dead dark mode CSS** | 15min | ~2KB of unused CSS |

### Backend Improvements
| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 33 | **Optimize `/api/stats`** — use SQL aggregation | 1h | Instead of fetching all rows client-side |
| 34 | **Add RSVP update/edit endpoint** | 2-3h | Let guests update their RSVP with email + code |
| 35 | **Add DELETE endpoints** for guests, vendors, invoices | 1-2h | RESTful API completion |
| 36 | **Add PATCH endpoint for vendors** | 30min | Update vendor status, fee, contact |
| 37 | **Add PATCH endpoint for invoices** | 30min | Mark invoice as paid |
| 38 | **Generate Supabase TypeScript types** | 1h | `supabase gen types` → replace `any` types |
| 39 | **Simplify Supabase client** (remove proxy pattern) | 30min | Direct export instead of Proxy |

---

## 🟡 NEEDS DOMAIN (Wait for PassKit Signup)

These require the business email → PassKit account → API key flow.

| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 1 | **Real "Add to Wallet"** — Apple Wallet + Google Wallet passes | 8-12h | Requires PassKit API key. Includes: event ticket pass with QR code, venue, date, guest name, access code |
| 2 | **Email delivery via Resend** | 6-8h | Connect email templates to real sending. Resend: free tier (100/day) |
| 3 | **Automated RSVP reminder emails** | 4-6h | Vercel cron job → send to pending guests |

---

## 🟠 NEEDS PAID SERVICES

| # | Task | Cost | Est. Time | Details |
|---|------|------|-----------|---------|
| 1 | **SMS "Text me the link"** | ~$4 (500 texts via Twilio) | 3-4h | Phone number input → send SMS with wedding URL |
| 2 | **NFC tags on place cards** | ~$20-30 (100 tags) | 4-6h | Tap phone → opens guest's table info |
| 3 | **Apple Developer account** (if needed for wallet) | $99/yr | — | Only needed if not using PassKit |

---

## 🔵 FUTURE / NICE-TO-HAVE (After Wedding)

| # | Task | Est. Time | Details |
|---|------|-----------|---------|
| 1 | **Collaborative Spotify playlist** | 6-8h | Guest song suggestions, approve/reject queue |
| 2 | **Photo sharing gallery** | 6-8h | QR code → upload → masonry gallery |
| 3 | **Live streaming page** | 4-6h | YouTube Live embed, password gate |
| 4 | **Seating chart builder** | 16-20h | Drag-and-drop, table/guest assignment |
| 5 | **Day-of coordinator timeline** | 6-8h | Gantt-like minute-by-minute view |
| 6 | **Digital guest book with voice messages** | 8-12h | Record audio messages via browser |
| 7 | **AR photo frame** | 12-16h | Augmented reality overlay at venue |
| 8 | **Live guest feed on venue screens** | 8-12h | Real-time display of guest uploads |
| 9 | **Post-wedding photo gallery with facial recognition** | 16-20h | Tag people in photos |
| 10 | **Contract / document storage** | 3-4h | Upload vendor contracts |
| 11 | **Receipt / expense photo upload** | 3-4h | Snap receipt photos, attach to budget |
| 12 | **Plus-one approval workflow** | 3-4h | Admin approve/deny plus-ones |
| 13 | **Wedding website analytics** | 2-3h | Page views, RSVP conversion tracking |
| 14 | **A/B testing on RSVP page** | 4-6h | Test different form designs |

---

## 📅 RECOMMENDED BUILD ORDER

### Phase 1: Tonight/Tomorrow Morning (Before Domain)
1. ~~Admin authentication~~ (security — do first)
2. ~~Mass assignment fix~~ (security)
3. ~~Email UNIQUE constraint fix~~ (data integrity)
4. ~~Countdown timer~~ (quick win, 2h)
5. ~~Guest book / well-wishes~~ (high value, 4-6h)
6. ~~Hotels & accommodation~~ (essential for guests, 3-4h)
7. ~~CSV export~~ (caterer needs it, 2-3h)
8. ~~Budget tracker~~ (most wanted admin tool, 4-6h)
9. ~~Toast notifications~~ (UX improvement, 2h)
10. ~~Loading states~~ (UX improvement, 2h)

### Phase 2: After Domain (Tomorrow PM)
1. ~~Sign up for PassKit~~ with business email
2. ~~Build "Add to Wallet"~~ with real passes
3. ~~Set up Resend email delivery~~
4. ~~Build SMS "Text me the link"~~ (Twilio)

### Phase 3: Week 1-2 (Aug 1-14)
1. ~~Weather widget~~
2. ~~PWA support~~
3. ~~Dietary summary for caterer~~
4. ~~Vendor payment tracker~~
5. ~~Add invoice / delete guest functionality~~
6. ~~Wedding checklist~~
7. ~~Emergency contacts page~~

### Phase 4: Week 3-4 (Aug 15-31)
1. ~~Outfit color palette guide~~
2. ~~Local attractions guide~~
3. ~~RSVP edit/update endpoint~~
4. ~~Admin activity log~~
5. ~~Accessibility improvements~~
6. ~~Image optimization~~

### Phase 5: Polish (Sep 1-26)
1. ~~Error boundaries~~
2. ~~Empty states~~
3. ~~Any remaining UX improvements~~
4. ~~Full integration test~~
5. ~~Load test~~
6. ~~Backup plan~~

---

## 🔧 HOW TO DEPLOY

```bash
cd /c/Users/Justin/sites/lynchweddingsite
git add -A
git commit -m "Description of changes"
vercel --prod --yes
```

Token is saved in `~/.vercel/auth.json` — no need to re-authenticate.