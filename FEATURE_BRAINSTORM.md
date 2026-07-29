# Wedding Website — TRANSFORMATIONAL Feature Brainstorm

**Project**: lynchweddingsite.vercel.app (Next.js 14 · Supabase · Tailwind · Vercel)
**Date**: July 29, 2026
**Wedding**: Nikkita & Justin · September 26, 2026 · Four Seasons at Terra Lago, Indio, CA
**Time remaining**: ~59 days

---

## ⚠️ Pre-requisite: Fix the Foundation First

Before any transformational feature work, the **critical security and stability issues** must be addressed. These are non-negotiable blockers:

1. **No auth on admin panel** — Anyone can access `/admin` and see all guest PII, vendor costs, invoices
2. **Service role key exposed in `.env.local`** (committed to git)
3. **All API routes bypass RLS** with `supabaseAdmin` and zero auth
4. **Mass assignment vulnerability** in PATCH endpoint
5. **`ignoreBuildErrors: true`** in production — silently broken code

**Estimate**: 2–3 days to fix all criticals. Without this, adding features is building on a cracked foundation.

---

## Table of Contents
1. [PWA & Installability](#1-pwa--installability)
2. [NFC & QR Code Physical Experiences](#2-nfc--qr-code-physical-experiences)
3. [Real-Time Guest Check-In & Day-Of Coordination](#3-real-time-guest-check-in--day-of-coordination)
4. [AI-Powered Features](#4-ai-powered-features)
5. [Push Notifications & Communication](#5-push-notifications--communication)
6. [Integrations (Spotify, Google Photos, Venue Tools)](#6-integrations)
7. [Photo & Video Sharing](#7-photo--video-sharing)
8. [Wedding Analytics & Admin Intelligence](#8-wedding-analytics--admin-intelligence)
9. [Guest Experience Wow-Factors](#9-guest-experience-wow-factors)
10. [Priority Matrix](#10-priority-matrix)

---

## 1. PWA & Installability

### 1.1 Full Progressive Web App (PWA)
**Feasibility**: ✅ Easy — 2–3 days
**Cost**: Free (no paid services)
**Priority**: 🔥🔥 HIGH

**What**: Turn the site into a fully installable PWA. Guests on iOS/Android see an "Add to Home Screen" prompt. The app opens full-screen with its own icon, splash screen, and no browser chrome.

**Why it transforms**: The wedding website becomes a first-class app on every guest's phone — not a bookmark they'll forget. The icon on their home screen is a constant reminder. It works offline (shows cached itinerary, venue info, directions).

**Implementation**:
- Generate `manifest.json` with wedding colors, icon sizes (192x192, 512x512), theme color
- Use `@serwist/next` (modern fork of `next-pwa`) for service worker registration
- Cache static assets and key pages (itinerary, venue info, registry)
- Offline fallback page: "You'll need internet to see full wedding details"
- Register service worker in `layout.tsx`
- **Already have icons**: `/icon-light-32x32.png`, `/icon-dark-32x32.png`, `/icon.svg`, `/apple-icon.png` — just need to generate the 192/512 sizes

**Key detail**: Safari on iOS only supports PWA since iOS 16.4+. The "Add to Home Screen" prompt is automatic when the manifest is detected. No app store submission needed.

---

### 1.2 Apple Wallet / Google Pay Digital Ticket
**Feasibility**: ⚠️ Medium — 4–6 days
**Cost**: Free (PassKit API) or paid ($99 Apple Developer cert for Wallet)
**Priority**: 🔥 HIGH

**What**: After RSVP, generate a real digital wallet pass that lives on the guest's phone. Contains: event name, date, time, venue, seat/table number, guest name, QR code (for check-in). Works on both Apple Wallet (`.pkpass`) and Google Wallet.

**Why it transforms**: Guests never lose the details — it's always on their phone, accessible from the lock screen with a double-tap. The QR code in the wallet pass is scanned at check-in. Eliminates paper tickets entirely.

**Implementation**:
- **Apple Wallet**: Use `passkit-generator` npm package. Requires an Apple Wallet Developer certificate (free with Apple Developer account, $99/year for distribution). Generate `.pkpass` server-side in a route handler.
- **Google Wallet**: Use Google Wallet REST API. Requires Google Cloud service account + Wallet issuer account. Free per pass.
- **Unified approach**: Use a service like **PassKit** (paid, ~$0.10/pass) or **WalletPass** that handles both platforms with one API.
- **Simpler fallback**: Generate `.ics` calendar file + styled PDF ticket — works on any device, no wallet infrastructure needed. Already have `.ics` generation in the codebase.

**Current state**: The "Add to Wallet" button exists but downloads a `.ics` file (calendar invite), not a real wallet pass. Fix this to generate real passes.

---

### 1.3 Offline Mode for Day-Of Schedule
**Feasibility**: ✅ Easy — 1 day (part of PWA effort)
**Cost**: Free
**Priority**: 🔥 HIGH

**What**: The entire itinerary, venue map, hotel info, and emergency contacts are cached in the service worker. Guests can access the day-of schedule even with spotty cell reception at the venue.

**Why it transforms**: Wedding venues (especially estates like Terra Lago) often have poor cell reception. Guests who didn't pre-download the schedule are stuck. Offline mode means the schedule is always available.

**Implementation**: Service worker cache-first strategy for `/`, `/program`, and static assets. Add a "Saved for Offline" badge on the itinerary page.

---

## 2. NFC & QR Code Physical Experiences

### 2.1 NFC-Enabled Place Cards at Reception
**Feasibility**: ⚠️ Medium — 3–4 days + hardware
**Cost**: ~$20-50 (NFC stickers/tags) + free software
**Priority**: 🔥🔥 HIGH (wow factor)

**What**: Each place card at the reception has a printed QR code AND an embedded NFC tag. When a guest taps their phone to the place card, it opens a personalized page showing:
- "Welcome, [Name]!" with their table number
- Who else is at their table (names + photos)
- The menu with their meal choice highlighted
- A personal message from the couple
- Table location map

**Why it transforms**: This is a **magical moment**. Guests walk into the reception, tap their place card, and their phone lights up with a personalized welcome. It eliminates "where do I sit?" confusion. It's a conversation starter. It feels like a luxury event.

**Implementation**:
- **NFC tags**: Buy NTAG213 or NTAG215 stickers (~$0.30-0.50 each on Amazon). Write a URL to each: `https://lynchweddingsite.vercel.app/table?code=GUEST-ACCESS-CODE`
- **QR code**: Print on the place card as backup (some guests won't have NFC-enabled phones)
- **Page**: Create a dynamic route `/table/[code]` that looks up the guest, shows their table assignment, tablemates, menu, and a welcome message
- **Supabase**: Query `guests` table by access code, join with `seat_assignments` and `tables`
- **Admin**: Generate a CSV of NFC URLs to write to tags, plus a print-ready PDF of place cards with QR codes

**Hardware needed**: NFC writer (phone app works — NFC Tools on iOS/Android, free). Only need to write ~100-150 tags.

---

### 2.2 QR Code on Physical Invitation
**Feasibility**: ✅ Easy — 1 day
**Cost**: Free (just a QR code image)
**Priority**: 🔥🔥 HIGH

**What**: A QR code on the printed wedding invitation that links to the wedding website. Use a **personalized** QR code per guest (embedding their access code) so the site auto-fills their name and skips the RSVP form's name field.

**Why it transforms**: The QR code on the invitation is the #1 way guests find the website. Making it personalized means they tap → the site opens → their name is pre-filled → they RSVP in 2 taps. It's the difference between "I'll do this later" (and forgetting) and "done in 10 seconds."

**Implementation**:
- Generate QR codes with `react-qr-code` (already in package.json) for each guest
- URL format: `https://lynchweddingsite.vercel.app/rsvp?code=WED-LYNCH-123456`
- The RSVP page reads the `code` query param, looks up the guest, pre-fills name and email
- Admin: "Generate QR Code Sheet" button that creates a printable PDF of all guest QR codes with names
- **Alternative**: Use a single QR code pointing to the generic site (simpler but less magical)

---

### 2.3 QR Code Check-In at Venue
**Feasibility**: ✅ Easy — 2 days
**Cost**: Free
**Priority**: 🔥🔥 HIGH

**What**: At the venue entrance, guests scan their QR code (from their wallet pass, email, or printed place card) to check in. The admin sees a real-time dashboard of who has arrived. Guest list auto-updates.

**Why it transforms**: No clipboards, no printed guest list, no "Is [Name] on the list?" confusion. The greeter scans codes with their phone. The admin sees live check-in counts. This is the same technology used at conferences and concerts.

**Implementation**:
- **Greeter's phone**: A simple `/admin/check-in` page on the admin dashboard with a camera scanner (using `html5-qrcode` library or the native `navigator.mediaDevices`)
- **Guest's code**: The QR code from their wallet pass, email confirmation, or printed place card
- **Backend**: `PATCH /api/rsvp/[id]` sets `check_in = true` and `check_in_at = now()`
- **Real-time**: Use Supabase Realtime subscriptions to push check-in events to the admin dashboard
- **Audio feedback**: The greeter's phone beeps on successful scan

---

### 2.4 NFC Guest Book Station
**Feasibility**: ⚠️ Medium — 3–4 days + hardware
**Cost**: ~$50-100 (tablet mount + NFC reader or just a tablet with camera)
**Priority**: Medium

**What**: A dedicated tablet/phone at the reception running a "Digital Guest Book" page. Guests tap their NFC-enabled place card (or scan their QR code) to autofill their name, then leave a video message, voice note, or text message. The messages appear on a live feed displayed on screens at the venue.

**Why it transforms**: Instead of a physical guest book that sits on a shelf, this creates a living, multimedia keepsake. Video messages from guests are priceless. The live feed on screens creates energy and FOMO ("I should leave a message too!").

**Implementation**:
- **Tablet**: A dedicated iPad or Android tablet on a stand at the reception. Open the wedding site in kiosk mode.
- **Page**: `/guestbook` — NFC tap or QR scan fills in the guest name, then camera/mic access for video or voice message
- **Upload**: Video/audio to Supabase Storage (free tier: 1GB)
- **Display**: Live feed on the reception screens via a web app or casted page
- **Admin**: Moderate messages before they go live

---

## 3. Real-Time Guest Check-In & Day-Of Coordination

### 3.1 Real-Time Check-In Dashboard
**Feasibility**: ✅ Easy — 2 days (builds on QR check-in above)
**Cost**: Free (Supabase Realtime is free)
**Priority**: 🔥🔥 HIGH

**What**: A live-updating dashboard on the admin page showing:
- Total guests checked in (with countdown timer "X of Y guests arrived")
- Recent check-ins in a scrolling feed ("Charlotte Whitfield checked in 30s ago")
- Guests not yet arrived (sorted by expected arrival time)
- Alerts for VIP/wedding party arrivals

**Why it transforms**: The coordinator knows exactly who has arrived, who's missing, and can make announcements before dinner. No more "Has [Name] arrived yet?" running around.

**Implementation**:
- **Supabase Realtime**: Enable Realtime on the `guests` table. Subscribe to `UPDATE` events where `check_in` changes.
- **Dashboard**: Add a real-time check-in widget to the admin dashboard page
- **WebSocket**: Supabase Realtime uses WebSockets under the hood — no polling needed
- **Audio cue**: Play a subtle chime on the admin dashboard when someone checks in

---

### 3.2 Vendor Check-In Coordination
**Feasibility**: ✅ Easy — 1–2 days
**Cost**: Free
**Priority**: Medium

**What**: Separate check-in flow for vendors (caterer, photographer, DJ, florist). Each vendor gets a unique code. When they arrive, they check in via a simple page. The admin sees "All vendors confirmed" or "Still waiting: Florist, DJ."

**Why it transforms**: The #1 wedding-day stress is tracking vendor arrivals. Instead of calling each vendor, the coordinator checks a dashboard. If a vendor is late, they get an automated reminder text.

**Implementation**:
- Extend the `vendors` table with `check_in_code` and `check_in_at`
- Simple vendor check-in page: `/vendor-checkin?code=CAT-1234`
- Admin dashboard: "Vendor Arrivals" section with timeline
- Auto-notification: If vendor hasn't checked in 30 min before their call time, send SMS (via Twilio)

---

### 3.3 Emergency Broadcast to All Guests
**Feasibility**: ⚠️ Medium — 3–4 days
**Cost**: ~$5-10 (Twilio SMS credits)
**Priority**: 🔥 HIGH

**What**: A single button on the admin dashboard: "Send Emergency Broadcast." Type a message → all guests who accepted get an SMS and/or push notification. Use cases: venue change, weather delay, schedule change, urgent announcement.

**Why it transforms**: On a wedding day, things change. A ceremony moves indoors due to wind. Dinner runs late. The DJ is stuck in traffic. Instead of the coordinator running around telling people, one button reaches everyone instantly.

**Implementation**:
- **SMS**: Twilio Messaging API. Loop through confirmed guests and send SMS. ~$0.0079/SMS in US. 100 guests = ~$0.79.
- **Push notification**: If using PWA + service worker, send push via Firebase Cloud Messaging or VAPID (requires HTTPS and service worker registration)
- **Admin UI**: Textarea + "Send to All" / "Send to Wedding Party" / "Send to Vendors" buttons
- **Confirmation**: "This will send an SMS to 87 guests. Are you sure?"
- **Log**: Keep a log of sent broadcasts for accountability

---

### 3.4 Real-Time Itinerary Changes
**Feasibility**: ✅ Easy — 1–2 days
**Cost**: Free
**Priority**: Medium

**What**: If the itinerary changes (e.g., "Dinner pushed to 7:30 PM"), the admin updates it in the dashboard and the change is pushed live to all guests' PWA apps. The service worker shows a notification: "Schedule updated: Dinner is now at 7:30 PM."

**Why it transforms**: No more "Did you hear dinner is delayed?" rumors. The official schedule is always authoritative and always up-to-date.

**Implementation**:
- Use Supabase Realtime on the `settings` or `itinerary` table
- When the admin updates the itinerary in the dashboard, the change is synced to all open PWA sessions
- For guests who aren't actively viewing, use push notifications (requires PWA + service worker)

---

## 4. AI-Powered Features

### 4.1 AI Menu Recommendations Based on Dietary Restrictions
**Feasibility**: ⚠️ Medium — 3–4 days
**Cost**: Free (OpenAI API ~$0.10 for all guests) or free with a local model
**Priority**: Medium

**What**: When a guest selects "Vegan" or enters dietary restrictions, an AI suggests the best meal option. "Based on your gluten-free preference, we recommend the Chicken or the Fish option. The Beef has a soy-based marinade."

**Why it transforms**: Guests with dietary restrictions often agonize over meal choices. The AI gives them confidence. It's a small touch that makes guests feel cared for.

**Implementation**:
- **Option A (AI-powered)**: Call OpenAI API (or Anthropic) on the RSVP backend when `dietary` is non-empty. Pass the meal options + dietary restrictions → return recommendation. Cache the result in the guest record.
- **Option B (Rule-based, simpler)**: Map common dietary restrictions to meal options using a simple lookup table. No AI needed, works 90% of the time.
- **UI**: Show a subtle badge: "Recommended for you" on the meal option
- **Admin**: See all dietary recommendations in the catering dashboard

---

### 4.2 AI-Generated Welcome Message for Each Guest
**Feasibility**: ✅ Easy — 1–2 days
**Cost**: ~$0.50-1.00 (OpenAI API for 100 guests)
**Priority**: Low (nice-to-have)

**What**: When a guest opens their personalized page (via NFC tap or QR code), they see a unique welcome message: "Welcome, Sarah! Justin's college roommate and the one who introduced him to his love of hiking. We're so glad you're here!"

**Why it transforms**: The personalized welcome is a moment of delight. "Wait, how did they know about hiking?" It feels like the couple personally welcomed every guest.

**Implementation**:
- Add a `notes` field to the `guests` table (filled by the couple during guest list creation)
- Server-side: On page load, generate a short welcome message using the guest's name, relationship, and notes
- Cache the generated message in the guest record (only generate once)
- **Alternative (no AI)**: The couple writes a short personal message for each guest manually — more authentic, less tech

---

### 4.3 AI-Powered Song Suggestion from Playlist
**Feasibility**: ⚠️ Medium — 3–4 days
**Cost**: ~$0.10 (OpenAI API) + Spotify API (free)
**Priority**: Low

**What**: A "Suggest a Song" form where guests describe the vibe ("a fun 80s dance song that everyone knows") and the AI finds the perfect song from Spotify. The suggestion is added to the queue.

**Why it transforms**: Instead of guests suggesting songs they can't remember the name of ("you know, that song from the movie..."), the AI handles the translation from vibe to song. It's magical.

**Implementation**:
- Guest enters: "A slow dance song from the 90s" or "Something upbeat for the bouquet toss"
- AI (OpenAI) converts the description to a Spotify search query
- Spotify Search API returns top match
- Guest confirms or picks from top 3 results
- Suggested song is added to the queue (pending admin approval)

---

### 4.4 AI-Powered Guest Photo Tagging
**Feasibility**: ⚠️ Hard — 5–7 days
**Cost**: ~$5-10 (Vision API or Rekognition for 1000 photos)
**Priority**: Low (post-wedding)

**What**: After the wedding, AI automatically tags guests in photos uploaded to the shared gallery. Uses facial recognition to match guest profile photos (from RSVP) with event photos. Guests are notified when they're tagged.

**Why it transforms**: The #1 frustration with wedding photos is finding photos of yourself. AI tagging means every guest can find their photos instantly. It's like Facebook's auto-tagging but for your wedding.

**Implementation**:
- **Post-wedding only**: This requires a face collection setup before the wedding
- Use **AWS Rekognition** or **Google Cloud Vision API** for facial recognition
- Create a face collection from guest RSVP selfies (optional: ask guests to upload a photo during RSVP)
- After the wedding, run the photo batch through the face recognition API
- Tag photos with guest names in the database
- **Privacy**: Guests must opt-in. Delete face data after tagging is complete.
- **Cost**: AWS Rekognition IndexFaces + SearchFacesByImage. ~$0.001 per image. 1000 photos = ~$1.

---

## 5. Push Notifications & Communication

### 5.1 Push Notifications via PWA Service Worker
**Feasibility**: ⚠️ Medium — 3–4 days
**Cost**: Free (VAPID keys, no paid service)
**Priority**: 🔥 HIGH

**What**: After the guest installs the PWA, they can opt-in to push notifications. The couple can send:
- "Schedule change: Dinner is now at 7:30 PM"
- "Photo gallery is live! Upload yours here"
- "Thank you for celebrating with us! ✨"
- "Reminder: RSVP deadline is August 1st"

**Why it transforms**: Push notifications are the most direct communication channel. Higher open rate than email (90% vs 20%). No spam folder. The wedding website stays top-of-mind.

**Implementation**:
- Register service worker with `pushManager.subscribe()`
- Use **VAPID** (Voluntary Application Server Identification) for Web Push — free, no third-party service needed
- Server-side: `web-push` npm package to send notifications
- Supabase table: `push_subscriptions` (id, guest_id, subscription_json, created_at)
- Admin dashboard: "Send Push Notification" UI
- **Limitation**: iOS Safari doesn't support Web Push until iOS 16.4+. Works on Android Chrome/Firefox.

---

### 5.2 Automated RSVP Reminder Emails
**Feasibility**: ✅ Easy — 2–3 days
**Cost**: Free (Resend free tier: 100 emails/day) or ~$2-5 (higher volume)
**Priority**: 🔥🔥 HIGH

**What**: Automated email reminders to guests who haven't RSVP'd by the deadline. The email includes a personalized link to the RSVP page, a QR code, and the wedding details.

**Why it transforms**: The couple doesn't have to manually chase guests. The system sends a polite reminder 2 weeks before the deadline, then 1 week before, then 3 days before. Each reminder is personalized.

**Implementation**:
- Integrate **Resend** (free tier: 100 emails/day, perfect for this volume) or **SendGrid** (free tier: 100 emails/day)
- Create a Supabase Edge Function or cron job that runs daily
- Query guests where `is_attending IS NULL` and `created_at < deadline - 7 days`
- Send personalized email with their name, RSVP link with access code, and QR code
- Track opens/clicks (Resend supports this)
- Admin: "Send Reminder Now" button on the RSVPs page

---

### 5.3 "Text Me This Link" SMS Share
**Feasibility**: ✅ Easy — 2–3 hours
**Cost**: ~$0.80 (Twilio: $0.0079/SMS × 100 invites)
**Priority**: 🔥 HIGH

**What**: A button on the hero section: "Text this link to my phone." Guest enters their phone number, receives a text with the wedding website URL. No bookmarking needed.

**Why it transforms**: The #1 question guests ask: "What's the URL again?" This solves it instantly. One tap, a text arrives, they tap the link, done.

**Implementation**:
- Twilio Messaging API (or Amazon SNS for ~$0.00645/SMS)
- Modal: "Enter your phone number to get the wedding link"
- Rate limit: 1 text per number per 10 minutes
- **Privacy**: Don't store the phone number unless the guest consents
- **Alternative (free)**: Use `sms:` link or WhatsApp share link — no API cost, works on mobile

---

## 6. Integrations

### 6.1 Collaborative Spotify Playlist
**Feasibility**: ⚠️ Medium — 4–6 days
**Cost**: Free (Spotify API)
**Priority**: 🔥 HIGH

**What**: An embedded Spotify playlist widget on the wedding site. Guests can "Suggest a Song" that gets added to a curated queue. The couple approves songs for the reception playlist. The final playlist becomes a post-wedding memento.

**Why it transforms**: Music is the emotional backbone of a wedding. Letting guests contribute builds anticipation. The DJ gets a pre-vetted list. The playlist lives on as a shared memory.

**Implementation**:
- **Spotify Developer App**: Register at developer.spotify.com (free). Get Client ID and Client Secret.
- **Create a collaborative playlist**: The couple creates a Spotify playlist and shares it via the API
- **Song suggestion form**: Guest types a song name → Spotify Search API → top 5 results → guest picks → added to pending queue
- **Supabase table**: `song_suggestions` (id, guest_name, song_title, artist, spotify_uri, status: pending/approved/rejected, created_at)
- **Admin**: Approve/reject suggestions. View playlist. Export to Spotify.
- **Embedded player**: Spotify Web Playback SDK or simple iframe embed
- **Note**: Collaborative playlists require the couple to be the playlist owner. The API can add songs to the playlist with the proper scope.

---

### 6.2 Google Photos Shared Album
**Feasibility**: ⚠️ Medium — 3–4 days
**Cost**: Free (Google Photos API, quota: 10,000 requests/day)
**Priority**: 🔥 HIGH

**What**: A shared Google Photos album where guests can upload their photos. The album is embedded on the wedding site. Guests see a live feed of everyone's photos.

**Why it transforms**: The #1 wedding-tech ask. Guests take hundreds of photos on their phones that the couple never sees. This solves it elegantly — no need to AirDrop, text, or email photos.

**Implementation**:
- **Option A (Google Photos API)**: Create a shared album via the Google Photos Library API. Use OAuth to let guests upload. Embed the album on the site.
- **Option B (Supabase Storage)**: Guests upload photos to a Supabase Storage bucket. Display in a masonry gallery. Simpler, no third-party API dependency.
- **Option C (Hybrid)**: Use Google Photos for long-term storage, Supabase for the upload flow. Best of both worlds.
- **QR code**: A QR code on the program card that opens the upload page directly
- **Gallery page**: `/photos` — masonry grid with lazy loading, lightbox viewer

**Recommendation**: Start with **Option B** (Supabase Storage) — it's self-contained, free up to 1GB, and doesn't require OAuth setup. Add Google Photos sync as a post-wedding batch export.

---

### 6.3 Honeyfund / Registry Integration
**Feasibility**: ✅ Easy — 2–3 hours
**Cost**: Free
**Priority**: 🔥 HIGH

**What**: Deeper integration with the Honeyfund registry. Instead of a simple link, show live registry items with photos, prices, and a "Contribute" button. Track contributions anonymously.

**Why it transforms**: The registry page becomes a browsable, engaging experience rather than a link-out. Guests can see what's been purchased and what's still available.

**Implementation**:
- Check if Honeyfund has a public API or embeddable widget
- If not, create a simple static page that mirrors the registry items (manually updated)
- **Alternative**: Use a registry aggregator like Zola or The Knot that has better embed support
- Add a "Contribution Progress" bar showing percentage funded

---

### 6.4 The Knot / Zola / Joy Sync
**Feasibility**: ⚠️ Hard — 5–7 days
**Cost**: Varies (some have paid APIs)
**Priority**: Low

**What**: Sync guest list, RSVPs, and registry data with The Knot, Zola, or Joy. The wedding website becomes the single source of truth, pushing updates to external platforms.

**Why it transforms**: The couple doesn't have to manage multiple guest lists. RSVP on the custom site automatically syncs to The Knot (if they're using it for guest management).

**Implementation**:
- **Challenge**: The Knot and Zola don't have public APIs for guest list sync. Zola has a partner API but requires approval.
- **Practical approach**: Export CSV from custom site, import to The Knot/Zola. One-time manual sync.
- **If using Joy**: Joy has a more open API. Could integrate directly.
- **Recommendation**: Skip this unless the couple is heavily using one of these platforms. The custom site already handles RSVPs.

---

## 7. Photo & Video Sharing

### 7.1 Live Guest Photo Feed on Reception Screens
**Feasibility**: ⚠️ Medium — 4–5 days
**Cost**: Free (or ~$20 for a Chromecast/Roku if venue doesn't have smart TV)
**Priority**: 🔥🔥 HIGH (wow factor)

**What**: During the reception, a live feed of guest-submitted photos appears on TV screens/monitors around the venue. Guests scan a QR code → upload a photo → it appears on the screens within 30 seconds. Curated by the couple (auto-approve family, moderate all).

**Why it transforms**: This is the **signature wow moment** of modern weddings. Guests see their photos appear on the big screen. It creates a feedback loop: "I posted a photo, now everyone sees it!" The energy in the room goes up. The dance floor fills faster.

**Implementation**:
- **Upload flow**: QR code → `/upload` page → camera/gallery → upload to Supabase Storage → Realtime event → display on screens
- **Display screen**: A tablet or laptop connected to a TV/projector, running a full-screen page: `/live-feed`
- **Supabase Realtime**: Subscribe to new photo uploads. New photos animate onto the screen with a fade-in.
- **Moderation**: Auto-approve (with a 5-second delay for easy removal). Admin can hide individual photos.
- **Layout**: Masonry grid with smooth transitions, auto-scroll to show newest photos
- **Hardware**: HDMI-connected TV, laptop/Chromecast, or an iPad mounted on a stand

---

### 7.2 Digital Guest Book with Voice Messages
**Feasibility**: ⚠️ Medium — 4–5 days
**Cost**: Free (Supabase Storage for audio)
**Priority**: 🔥 HIGH

**What**: A digital guest book where guests can leave text messages, voice recordings, or short video messages. The entries are displayed on a scrolling wall on the wedding site. Voice messages auto-play on hover.

**Why it transforms**: A physical guest book collects signatures and maybe a sentence. A digital guest book captures voices, laughter, and emotion. The couple can listen to their aunt's well-wishes or their college friend's toast for years to come.

**Implementation**:
- **Text**: Simple form (name + message), displayed in a scrollable feed
- **Voice**: `MediaRecorder` API → record up to 30 seconds → upload to Supabase Storage as `.webm` → display with play button
- **Video**: Same as voice but with camera (optional, lower priority)
- **Guest book page**: `/guestbook` — masonry of cards, each with name, timestamp, and message type
- **Admin**: Approve/reject entries, download audio files
- **QR code**: On the reception table, a QR code that opens the guest book directly

---

### 7.3 Post-Wedding Photo Gallery with Download
**Feasibility**: ✅ Easy — 2–3 days
**Cost**: Free (Supabase Storage)
**Priority**: 🔥 HIGH

**What**: After the wedding, a password-protected gallery page where guests can browse and download all professional photos and guest-submitted photos. Organized by event (Ceremony, Cocktail Hour, Reception, Dancing).

**Why it transforms**: The wedding photos are the most-asked-for item after the wedding. Instead of emailing links or USB drives, the gallery is always available on the website. Guests can download their favorites.

**Implementation**:
- Create a `/gallery` page with:
  - Categories/tabs: Ceremony, Cocktail Hour, Reception, Dancing, Guest Photos
  - Lightbox viewer with keyboard navigation
  - Download button per photo (single or batch)
  - Password protection (same access code as RSVP)
- **Professional photos**: Upload to Supabase Storage in a `professional/` folder
- **Guest photos**: Already uploaded via the live feed (see above)
- **Thumbnail generation**: Use a serverless function or Vercel Edge to generate thumbnails (or use a CDN like Cloudinary for auto-transformation)

---

## 8. Wedding Analytics & Admin Intelligence

### 8.1 Wedding Website Analytics Dashboard
**Feasibility**: ✅ Easy — 2–3 days
**Cost**: Free (Vercel Analytics already installed) or free (Plausible/Umami self-hosted)
**Priority**: Medium

**What**: A detailed analytics view showing:
- Page views over time (spike after invitation delivery?)
- Which pages are most visited (Itinerary vs Registry vs RSVP)
- RSVP conversion rate (% of visitors who RSVP)
- Traffic sources (direct, QR code, SMS, social)
- Device breakdown (mobile vs desktop)
- Geographic heatmap of guests

**Why it transforms**: The couple knows what's working. Is the RSVP page confusing? Are guests finding the itinerary? When did traffic spike after the invitation was mailed? Data-driven decisions.

**Implementation**:
- **Vercel Analytics**: Already installed (`@vercel/analytics` in package.json) — gives basic page views and geolocation
- **Custom events**: Track `rsvp_submitted`, `guest_book_entry`, `photo_upload`, `nfc_tap` as custom events in Vercel Analytics
- **Admin dashboard**: Add an "Analytics" tab with charts from the analytics data
- **Alternative**: Self-host **Plausible** or **Umami** for privacy-first analytics (no cookie banner needed)

---

### 8.2 A/B Testing on RSVP Page
**Feasibility**: ⚠️ Difficult — 5–7 days
**Cost**: Free (manual A/B testing) or paid (Vercel Edge Config + Flags)
**Priority**: Low

**What**: Test two versions of the RSVP page to see which converts better. Examples: Button color (gold vs white), form layout (single column vs two column), with/without photo, meal choice order.

**Why it transforms**: A 10% improvement in RSVP conversion rate means 10 more guests respond. For a wedding with 100 guests, that's significant.

**Implementation**:
- Use **Vercel Feature Flags** or **LaunchDarkly** (free tier)
- Split traffic 50/50 between two variants
- Track conversion rate per variant
- **Simpler approach**: Manually test one change at a time, review analytics after a week, then switch
- **Overkill for a wedding**: Probably not worth the effort given the short timeline

---

### 8.3 Dietary Restriction Summary Report for Caterer
**Feasibility**: ✅ Easy — 2–3 hours
**Cost**: Free
**Priority**: 🔥 HIGH

**What**: A printable PDF report showing every dietary restriction, allergy, and meal choice per guest, grouped by meal type. The caterer gets a clean, actionable sheet.

**Why it transforms**: The caterer needs a single sheet showing "Beef: 27 guests, Chicken: 34, Fish: 12, Vegan: 8, Pork: 5." Currently, the admin would need to manually compile this. The report generates automatically.

**Implementation**:
- Add an "Export Caterer Brief" button to the catering dashboard
- Generate a printable page with meal counts, dietary restriction details, and per-guest breakdown
- Use `window.print()` for PDF generation (simple, no library needed)
- **Supabase query**: `SELECT meal_choice, COUNT(*) FROM guests WHERE is_attending = true GROUP BY meal_choice`

---

### 8.4 Guest List Export (CSV/Excel)
**Feasibility**: ✅ Easy — 1–2 hours
**Cost**: Free
**Priority**: 🔥 HIGH

**What**: Export the full guest list (with all fields) to CSV. Useful for the caterer, venue, photographer, or for the couple to print a seating chart.

**Implementation**:
- Server-side CSV generation: `GET /api/rsvp/export`
- Button on the RSVPs page: "Export CSV"
- Include: name, email, party size, meal choice, dietary, status, check-in, access code
- Auto-download as `wedding-guests-2026-09-26.csv`

---

## 9. Guest Experience Wow-Factors

### 9.1 Interactive Seating Chart with Guest Profiles
**Feasibility**: ⚠️ Hard — 10–14 days
**Cost**: Free
**Priority**: Medium

**What**: A visual seating chart page where guests can see the floor plan, click on a table to see who's sitting there, and click on a guest to see a short profile. "You're at Table 7 with [3 other guests]. [Name] is Justin's cousin from Chicago."

**Why it transforms**: Guests walk into the reception already knowing who they're sitting with. It breaks the ice. "Oh, you're at Table 7 too? I'm [Name]!" It's a conversation starter before the conversation starts.

**Implementation**:
- **Phase 1 (simple)**: Text-based table lookup. Guest enters name → "You're at Table 7. Also at your table: Sarah, Mike, Emily."
- **Phase 2 (visual)**: SVG floor plan with draggable table markers. Click a table → see guest list.
- **Supabase tables**: `tables` (id, name, capacity, x, y, shape), `seat_assignments` (id, guest_id, table_id, seat_number)
- **Admin**: Drag-and-drop seating chart builder (complex — see admin features)
- **NFC integration**: Tap the place card → opens the seating chart page directly

---

### 9.2 Wedding Countdown with Daily Surprises
**Feasibility**: ✅ Easy — 2–3 days
**Cost**: Free
**Priority**: Medium

**What**: A live countdown timer on the hero section. As the countdown progresses, it reveals daily "surprises": a photo of the couple, a fun fact, a quote from their vows, a song suggestion for the day, a weather update for Indio.

**Why it transforms**: The countdown becomes a reason to visit the site every day. Each new surprise builds anticipation. The couple can schedule 30 days of content.

**Implementation**:
- Client component with `useEffect` + `setInterval` (1s tick)
- Read date from `wedding-data.ts` (September 26, 2026)
- **Surprises array**: Pre-configured array of 30 entries (one per day for the last month). Each entry: date, type (photo/fact/quote/song), content.
- On each day, show the corresponding surprise below the countdown
- Use `motion` for smooth number transitions (already have the library)
- **After wedding**: Show "We did it! 💍" message

---

### 9.3 Wedding Playlist Voting
**Feasibility**: ⚠️ Medium — 4–5 days
**Cost**: Free (Spotify API)
**Priority**: Medium

**What**: A curated list of songs that guests can upvote/downvote before the wedding. The top-voted songs get priority on the dance floor. The couple can see which songs are most anticipated.

**Why it transforms**: The dance floor is packed when the DJ plays songs everyone knows and loves. Letting guests vote means the DJ plays what the crowd actually wants. It's democracy in action.

**Implementation**:
- Admin creates a list of 20-30 potential songs (or pulls from a Spotify playlist)
- Guests visit `/vote` → see the song list → upvote/downvote each song
- Results update in real-time (Supabase Realtime)
- DJ/admin views the ranked list on the day-of
- **Supabase table**: `song_votes` (id, guest_id, song_id, vote: +1/-1, created_at)
- **Display**: Live ranking bar chart on the admin dashboard

---

### 9.4 Virtual Photo Booth (GIF/Boomerang Capture)
**Feasibility**: ⚠️ Hard — 6–8 days
**Cost**: Free (browser APIs)
**Priority**: Low

**What**: A virtual photo booth page where guests take a short GIF/boomerang-style video using their phone camera. The GIFs appear on a scrolling wall on the site. At the reception, they're displayed on screens.

**Why it transforms**: A physical photo booth costs $500-1500 to rent. This is free. It's accessible from any phone. The GIF wall is a joyful, energetic feed of the celebration.

**Implementation**:
- Camera access via `navigator.mediaDevices.getUserMedia`
- Capture 10 frames over 2 seconds → create an animated GIF using `gif.js` library or encode as a video
- Upload to Supabase Storage
- Display in a masonry grid with autoplay (use `<video>` with `muted` + `autoplay` + `loop`)
- QR code at the venue to access the booth
- **Note**: Camera permissions may be intimidating for some guests. Make it optional.

---

### 9.5 Weather Forecast Widget for Travelers
**Feasibility**: ✅ Easy — 2–3 hours
**Cost**: Free (OpenWeatherMap free tier)
**Priority**: Medium

**What**: A small card on the site showing the 7-day forecast for Indio, CA. Out-of-town guests can plan their packing. On the day-of, shows current conditions.

**Why it transforms**: Indio/Coachella Valley in late September is typically 90-100°F. Guests from cooler climates need to know. The weather widget turns the site into a one-stop trip planning resource.

**Implementation**:
- Free **OpenWeatherMap** API (no credit card needed, 60 calls/minute free)
- Server-side fetch with caching (cache for 30 minutes)
- Display as a small card in the itinerary section or near the venue info
- Cached in Supabase or in-memory to avoid hitting rate limits

---

### 9.6 Nearby Hotels & Accommodation Guide
**Feasibility**: ✅ Easy — 3–4 hours
**Cost**: Free
**Priority**: 🔥 HIGH

**What**: A curated list of nearby hotels with booking links, room block codes, and distance from the venue. Include a Google Maps embed showing hotel locations relative to the Four Seasons.

**Why it transforms**: This is the #1 informational need for out-of-town guests. Without it, the couple fields 50 individual texts asking "where should we stay?" This is a massive friction reducer.

**Implementation**:
- Static data component (no backend needed for hotel info)
- Google Maps embed with pins for venue + hotels
- Room block codes if the couple has negotiated them
- Section between Registry and RSVP on the main page

---

## 10. Priority Matrix

### 🔥🔥 HIGH — Do Before Wedding (10-14 days of work)

| Feature | Days | Cost | Impact |
|---------|------|------|--------|
| **Fix critical security issues** | 3 | $0 | FOUNDATIONAL — must do first |
| **PWA (installable + offline)** | 3 | $0 | Every guest uses it |
| **QR check-in at venue** | 2 | $0 | Eliminates list-checking chaos |
| **Real-time check-in dashboard** | 2 | $0 | Coordinator knows who's arrived |
| **PWA push notifications** | 3 | $0 | Direct communication channel |
| **RSVP reminder emails** | 2 | $0-5 | Reduces chasing guests |
| **"Text Me This Link" SMS** | 0.5 | $1 | #1 guest friction reducer |
| **Live photo feed on reception screens** | 5 | $0 | **Signature wow moment** |
| **NFC place cards** | 4 | $20-50 | **Magical first impression** |
| **QR code on invitation** | 1 | $0 | Frictionless RSVP start |
| **Spotify playlist collaboration** | 5 | $0 | Builds anticipation, keepsake |
| **Digital guest book (voice + text)** | 4 | $0 | Emotional keepsake |
| **Post-wedding photo gallery** | 3 | $0 | Most-asked-for after wedding |
| **Hotels & accommodation guide** | 0.5 | $0 | #1 guest question answered |
| **Caterer dietary report** | 0.5 | $0 | Essential for vendor |
| **Guest list CSV export** | 0.5 | $0 | Needed by caterer, venue |

**Total HIGH**: ~38 days of work (can be parallelized across multiple people)

### 🔥 MEDIUM — If Time Permits (8-12 days)

| Feature | Days | Cost | Impact |
|---------|------|------|--------|
| **Apple Wallet / Google Pass ticket** | 5 | $0-99 | Nicer than .ics file |
| **Emergency broadcast SMS** | 3 | $5-10 | Safety net for day-of changes |
| **Real-time itinerary changes** | 2 | $0 | Keeps everyone informed |
| **Weather forecast widget** | 0.5 | $0 | Helpful for travelers |
| **Wedding countdown with surprises** | 2 | $0 | Builds daily anticipation |
| **Playlist voting** | 4 | $0 | Democratic dance floor |
| **Interactive seating chart** | 10 | $0 | Ice breaker, conversation starter |
| **NFC guest book station** | 4 | $50-100 | Physical-digital bridge |
| **Vendor check-in coordination** | 2 | $0 | Reduces day-of stress |
| **Analytics dashboard** | 2 | $0 | Data-driven insights |

### Low — Nice-to-Have / Post-Wedding

| Feature | Days | Cost | Notes |
|---------|------|------|-------|
| **AI menu recommendations** | 3 | $0.10 | Fun but not essential |
| **AI welcome messages** | 2 | $1 | Delightful but manual works too |
| **AI song suggestions** | 4 | $0.10 | Helpful for indecisive guests |
| **AI photo tagging (post-wedding)** | 6 | $5-10 | Post-wedding project |
| **Virtual photo booth GIFs** | 7 | $0 | Fun but camera-shy guests |
| **A/B testing RSVP page** | 5 | $0 | Overkill for wedding scale |
| **The Knot / Zola sync** | 6 | $0 | Only if already using those |

---

## Implementation Roadmap (59 Days to Wedding)

### Week 1 (Jul 29 – Aug 4): Foundation & Security
- **Days 1-3**: Fix all critical security issues (auth, RLS, service key, mass assignment)
- **Days 3-5**: PWA setup (manifest, service worker, offline support)
- **Days 5-7**: Basic check-in backend (QR code generation, PATCH endpoint, supabase realtime)

### Week 2 (Aug 5 – Aug 11): Guest Communication
- **Days 8-9**: RSVP reminder emails (Resend integration)
- **Day 10**: "Text Me This Link" SMS (Twilio)
- **Days 11-12**: Push notifications (VAPID + service worker)
- **Day 13**: Hotels & accommodation guide page

### Week 3 (Aug 12 – Aug 18): Physical Experiences
- **Days 14-16**: NFC place card system (route, tag writing, PDF generation)
- **Days 17-18**: QR code on invitation (generate personalized codes, test)
- **Day 19**: Real-time check-in dashboard

### Week 4 (Aug 19 – Aug 25): Photo & Video
- **Days 20-23**: Live photo feed on reception screens (upload flow, realtime display, moderation)
- **Days 24-25**: Digital guest book with voice messages

### Week 5 (Aug 26 – Sep 1): Music & Entertainment
- **Days 26-30**: Spotify playlist collaboration + voting

### Week 6 (Sep 2 – Sep 8): Admin Polish
- **Days 31-32**: Caterer dietary report, CSV export
- **Days 33-35**: Emergency broadcast system, vendor check-in

### Week 7 (Sep 9 – Sep 15): Wow Factors
- **Days 36-38**: Countdown with surprises, weather widget
- **Day 39**: Apple Wallet / Google Pass (if pursuing)

### Week 8 (Sep 16 – Sep 22): Testing & Dry Run
- **Days 40-44**: Full integration testing, dry run check-in, train greeters
- **Day 45**: Deploy all features, order NFC tags, print place cards

### Final Days (Sep 23 – Sep 26): Go Time
- **Sep 23**: Set up live feed screens at venue, test NFC tags
- **Sep 24**: Final walkthrough with coordinator
- **Sep 25**: Rehearsal dinner — test check-in system
- **Sep 26**: WEDDING DAY 🎉

---

## Key Decisions Needed

1. **NFC tags**: Order now? (~$20-50, need to know guest count)
2. **Hardware for live feed**: Does the venue have TVs with HDMI? Need a Chromecast/laptop?
3. **Twilio account**: Set up for SMS features (~$10 in credits)
4. **Resend account**: Set up for email sending (free tier sufficient)
5. **Spotify Developer App**: Register for playlist features
6. **Apple Wallet**: Need Apple Developer account ($99/year) for real `.pkpass` generation
7. **Guest count**: ~100-150? Affects NFC tag order, SMS cost estimates

---

## Cost Summary

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| NFC tags (NTAG213, 100-pack) | ~$20-30 | Amazon |
| Twilio SMS credits | ~$10 | 1,000+ SMS |
| Resend emails | $0 | Free tier (100/day) |
| Spotify API | $0 | Free |
| Supabase Storage | $0 | Free tier (1GB) |
| OpenWeatherMap | $0 | Free tier |
| Apple Developer account | $99/year | Only if doing Wallet passes |
| NFC writer (phone app) | $0 | NFC Tools app |
| **Total** | **~$30-139** | |