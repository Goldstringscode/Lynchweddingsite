# 📱 Mobile Optimization Checklist — Lynch Wedding Site

> **Target:** Zero horizontal scroll on any device < 768px wide. All content fits viewport.

## Public Wedding Site

- [ ] **Hero section** — Names ("Nikkita & Justin") don't overflow on 375px screens
- [ ] **Invitation card** — "You are cordially invited" text/scaling correct, no stretch, nested borders don't cause overflow
- [ ] **Program download button** — Fits within viewport on 375px, no scrollbar
- [ ] **Itinerary timeline** — Event popover doesn't overflow on mobile
- [ ] **Registry section** — Button/text fits within viewport
- [ ] **RSVP form** — All inputs, radio groups, and buttons fit without overflow
- [ ] **Footer** — Links don't overflow

## Admin Dashboard

- [ ] **Sidebar** — Mobile hamburger menu opens/closes correctly, no horizontal scroll
- [ ] **Dashboard page** — Stat cards stack and fit on mobile
- [ ] **RSVPs page** — Table responsive (horizontal scroll only on table, not page)
- [ ] **Vendors page** — Cards/table fit mobile
- [ ] **Menu & Catering** — Tabs, analytics charts, menu editor, preview all fit mobile
- [ ] **Invoices page** — Table responsive
- [ ] **Checklist page** — Category cards and items fit mobile
- [ ] **Email Templates** — Editor/preview fit mobile
- [ ] **Settings page** — All controls fit mobile
- [ ] **Admin login** — Form centered and fits mobile

## Program Page (/program)

- [ ] **Download PDF button** — Fits mobile, no overflow
- [ ] **Program content** — All text fits viewport
- [ ] **Print styles** — Clean print/PDF output on all sizes

## Technical Checks

- [ ] No `overflow-x-hidden` on `<body>` or `<html>` (causes layout bugs)
- [ ] All buttons with `<a>` render wrappers don't overflow
- [ ] Images have `max-width: 100%` and proper aspect ratios
- [ ] Responsive text sizes using `text-sm md:text-base` pattern
- [ ] No fixed-width elements that exceed viewport
- [ ] Touch targets at least 44x44px on mobile