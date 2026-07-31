# 🚀 Feature Suggestions — lynchweddingsite

**Date:** July 29, 2026
**Source:** 3-agent audit cross-check + FEATURE_BRAINSTORM.md analysis
**Wedding:** Nikkita & Justin · September 26, 2026 · Four Seasons at Terra Lago, Indio, CA

---

## Guest Experience Features

### PWA Installability (2-3 days · High Value)
Guests can install the wedding site as a full-screen app on their phone with its own icon, splash screen, and offline support. No browser chrome. Works offline for day-of schedule.

### QR Code Check-In at Venue (2 days · High Value)
Guests scan their QR code at the entrance → greeter's phone beeps → live check-in dashboard updates. No clipboards, no printed guest list.

### Digital Guest Book (4-6 days · High Value)
Guests leave text, voice recordings, or short video messages. Displayed in a scrolling wall on the site. Voice messages auto-play on hover. QR code on reception table opens it directly.

### Live Photo Feed on Reception Screens (4-5 days · High Value)
Guest-submitted photos appear on venue TV screens within 30 seconds. Scan QR → upload → appears on the big screen. Creates energy and FOMO. Supabase Realtime sync.

### NFC-Enabled Place Cards (3-4 days + ~$30 hardware · High Value)
Tap phone to place card → personalized welcome with table number, tablemates, menu choice, and personal message from the couple. Luxury wedding wow factor.

### Emergency Broadcast SMS (3-4 days · Medium Value)
Single button on admin dashboard sends SMS to all guests. Use cases: venue change, weather delay, schedule change. ~$0.79 for 100 guests via Twilio.

### Collaborative Spotify Playlist (4-6 days · Medium Value)
Guests suggest songs → admin approves → added to reception playlist. Embedded player on the site. Final playlist becomes post-wedding memento.

### Weather Forecast Widget (3 hours · Medium Value)
7-day forecast for Indio, CA using free OpenWeatherMap API. Helps guests plan attire and activities.

### Hotels & Accommodation Section (3-4 hours · Medium Value)
Curated list + Google Maps embed + booking links for out-of-town guests staying near Terra Lago.

### Countdown Timer in Hero (2 hours · Low Value)
Days/hours/minutes/seconds to ceremony. Simple engagement boost.

### Outfit Color Palette Guide (1-2 hours · Low Value)
Visual style guide for the Black Tie dress code. Helps guests pick appropriate attire.

### "Text Me This Link" SMS Share (2-3 hours · Medium Value)
Button in hero section: guest enters phone number → receives text with wedding URL. ~$0.80 for 100 texts via Twilio.

---

## Admin Features

### Guest List CSV Export (2-3 hours · High Value)
Downloadable guest list with meal choices, dietary restrictions, attendance status. Caterer needs this.

### Dietary Summary for Caterer (3-4 hours · High Value)
Printable report grouped by meal choice. Shows counts + individual restrictions.

### Budget Tracker (4-6 hours · High Value)
Track planned vs actual spending. Visual charts. New `budget_items` table.

### Vendor Payment Tracker (4-6 hours · High Value)
Track deposits, milestone payments, remaining balance per vendor.

### Wedding Checklist (4-6 hours · High Value)
Pre-populated with 50+ common wedding tasks. Track completion, assign to wedding party.

### Admin Activity Log (3-4 hours · Medium Value)
Audit trail of who did what in the admin dashboard.

### Emergency Contacts Page (2-3 hours · Medium Value)
One-tap call buttons for venue, caterer, photographer, coordinator.

### RSVP Edit/Update Endpoint (2-3 hours · Medium Value)
Let guests update their RSVP using their email + access code.

---

## Menu Builder Improvements

### Active/Draft Status for Menu Items (2-3 hours)
Catalog should filter active items vs drafts. Currently returns ALL items unconditionally.

### Item Images (4-6 hours)
Visual menu builder with item photos. Upload to Supabase Storage.

### Drag-and-Drop Course Ordering (4-6 hours)
Better UX than incrementing course_number manually.

### Cost Projection Per Guest Count (2-3 hours)
Scale ingredient costs dynamically based on guest count.

### Wine/Beverage Pairing Suggestions (3-4 hours)
Suggested beverage pairings for each menu item. Upsell feature for catering.

---

## Backend/Security Improvements

### Zod Validation on All API Routes (2-3 hours)
Replace custom `sanitizeFields()` with proper Zod schemas on every endpoint.

### Rate Limiting on Public RSVP (1 hour)
Prevent spam submissions. IP-based throttling via Upstash or Vercel KV.

### Unused Dependencies Cleanup (30 minutes)
Remove unused `prisma`, `@prisma/client`. Move `shadcn` to devDependencies.

### Set `noUnusedLocals` / `noUnusedParameters` in tsconfig (15 minutes)
Catch dead code at compile time.

### Remove Dead CSS (15 minutes)
Remove unused `.dark` block and `@media (prefers-color-scheme: dark)` from globals.css (~70 lines).

### Remove Dead Components (5 minutes)
Delete `components/ui/progress.tsx` — never imported anywhere.

---

## Post-Wedding Features

- AI-powered guest photo tagging via facial recognition
- Post-wedding photo gallery with download
- Wedding video highlight reel page
- Thank-you card generator
- Anniversary countdown / reminder

---

## Platform Robustness (Cross-Cutting)

| Area | Current Issue | Suggested Improvement |
|------|-------------|----------------------|
| Error Boundary | Only 1 of 9 components wrapped | Wrap all sections with ErrorBoundary + retry button |
| Loading States | 4 dashboard pages have none | Add skeleton loaders for all data-fetching components |
| Empty States | VendorsPage, InvoicesPage missing | Add "No items yet" messages |
| Accessibility | Hero scroll link broken, no aria-live region | Fix anchor target, add polite announcements |
| Image Optimization | `images.unoptimized: true` | Remove flag, use next/Image with priority |
| Build Safety | `ignoreBuildErrors: true` | Remove and fix type errors |
| Toast System | `<Toaster />` never rendered | Add to root layout so sonner toasts are visible |
| Auth Cookie | Scoped to /admin path (can't protect APIs) | Change to path: '/' or restructure API routes |
