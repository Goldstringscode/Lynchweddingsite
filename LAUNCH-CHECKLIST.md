# 🎉 Lynch Wedding Site — Pre-Launch Checklist

> **Last updated:** 2026-08-04 · **Wedding:** Saturday, September 26, 2026 · 4:00 PM
> Four Seasons at Terra Lago, 85-370 Terra Lago Pkwy, Indio, CA 92203
> Live site: https://houseoflynch.app

---

## 🚨 Critical (blocks launch)

- [ ] **Verify guest list is clean** — seed/example guests deleted (13 removed 2026-08-04). Confirm only real guests remain in admin → RSVPs.
- [ ] **Create Honeyfund registry page** and replace the placeholder `registryUrl` in `lib/wedding-data.ts` (currently points to honeyfund.com homepage, not the real registry).
- [ ] **A2P 10DLC campaign approval** — SMS to US carriers blocked until Twilio carrier review completes (IN_PROGRESS since 2026-08-03). Daily 9 AM cron watches; no action needed, but don't promise guests texts until APPROVED.

## 📱 Photo Sharing (QR / WedUploader)

- [ ] Create WedUploader album (~$39 one-time) at weduploader.com
- [ ] Provide album link → set `NEXT_PUBLIC_SHARE_URL` env var on Vercel
- [ ] Test QR end-to-end on a phone: scan `houseoflynch.app/share-qr.svg` → lands on the album
- [ ] Confirm QR placement in printed program (SVG in `public/share-qr.svg`, live on program page)
- [ ] Verify Google Drive storage has headroom before the wedding (15 GB free; upgrade to 100 GB ~$2/mo if needed)

## 📝 Content Accuracy (verify on live site)

- [ ] Date/time: Saturday, September 26, 2026 · 4:00 PM
- [ ] Venue + address: Four Seasons at Terra Lago, 85-370 Terra Lago Pkwy, Indio, CA 92203
- [ ] Dress code: "Black Tie Event | An Evening Draped in Black"
- [ ] Hashtag: #HouseofJusNik
- [ ] Itinerary times: Ceremony 4:00 · Cocktail 5:00 · Reception 5:45 · First Dance 6:30 · Dinner 7:00 · Dancing 7:30–midnight
- [ ] RSVP form works: meal choice, dietary field, guest count, duplicate-email guard
- [ ] Privacy & Terms pages return 200 (required for Twilio A2P compliance)

## 💬 SMS & Guest Communications

- [ ] Once campaign APPROVED: send test to 479-530-7328, watch for `delivered` badge
- [ ] Review 3 SMS templates (Invitation / Reminder / Thank You) — dates, venue, links correct
- [ ] Confirm thank-you tracker marks guests correctly in admin → SMS tab
- [ ] Plan outreach sequence: link distribution vs. SMS follow-up

## 🔐 Admin & Security

- [ ] Admin password strong (not default)
- [ ] Admin dashboard renders light mode on all tabs
- [ ] Supabase RLS enabled — guest data not publicly readable
- [ ] No hardcoded secrets in repo (Twilio/Supabase creds via env only)
- [ ] Test admin actions: RSVP check-in, guest edit, SMS send

## 💳 Money & Services

- [ ] Twilio funded (check balance in admin/status script)
- [ ] Domain houseoflynch.app renewal — this is the QR's "never expires" guarantee
- [ ] Vercel plan adequate for launch-week builds

## 🧹 Housekeeping

- [ ] Final mobile test: home, RSVP, program, share pages on an actual phone
- [ ] Full `npm run build` + deploy after all edits
- [ ] Review cron jobs (daily 9 AM Twilio status check intentional)

---

## Quick Reference — Key Files

| File | Purpose |
|------|---------|
| `lib/wedding-data.ts` | Wedding details (names, date, venue, hashtag, registry) |
| `app/api/sms/send/route.ts` | SMS send via Twilio Messaging Service |
| `app/api/sms/status/route.ts` | Delivery webhook + history |
| `app/share/route.ts` | QR redirect (WedUploader destination) |
| `public/share-qr.svg` / `.png` | Print-ready QR assets |
| `components/dashboard/pages/sms-page.tsx` | SMS admin UI + thank-you tracker |
