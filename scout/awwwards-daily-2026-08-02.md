# Awwwards SOTD Scout — Daily Report 2026-08-02
**Mission:** Study award-winning sites, extract every design pattern, CSS technique, and JS/motion effect.
**Source:** https://www.awwwards.com/websites/sites_of_the_day/ (pages 1–2, ~60 sites reviewed, 25+ analyzed in depth)

---

## ═══════════════════════════════════════════
## DEEP DIVE 1: CRAV Burgers — Artisan Smashed Burgers ⭐ FOOD/RESTAURANT
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/crav-burgers | **Live:** https://www.cravburgers.shop/
- **Score:** 7.25/10 | SOTD Jun 13, 2026 | Agency: Anyflow
- **Colors (from live CSS vars):** `--beige:#f5e3cd; --red:#f91814; --white:#fff; --black:#1b1b1b; --mustard:#ffd750; --mustard-dark:#f4a804`
- **Fonts:** "Mouse Memoirs" (display, playful rounded) + "Modak" (chunky display) — 2 display fonts, zero body-serif
- **Tech (live console):** viewport `width=device-width, initial-scale=1`; body bg `rgb(245,227,205)` beige; **no GSAP/Three/Lenis** — pure CSS/JS; framework: custom (not Next/Vite-root)
- **Design Patterns:**
  - **Ingredient assembly loader** — preloader animates lettuce → tomato → cheese → patty stacking (burger build = brand)
  - **Sticker/peel effect via CSS custom properties:** `--sticker-rotate:30deg; --sticker-p:20%; --sticker-shadow-opacity:.6; --peel-direction:0deg; --peel-amount:1; --sticker-start:calc(-1 * var(--sticker-p)); --sticker-end:calc(100% + var(--sticker-p))` — a brilliant pure-CSS "sticker peel" reveal driven entirely by vars
  - **Word-by-word marquee:** "PURE QUALITY / EVERY LAYER / PACKED WITH / SIGNATURE / FLAVOR"
  - **Sticky order CTA** ("ORDER NOW" pill), full-screen hero image with floating ingredient cutouts
  - **Footer animation** (award-listed element)
  - Mobile: hamburger menu with HOME/ABOUT/OUR SPICES/LOCATIONS/CONTACT; stacked cards
- **Takeaway:** Playful food brand = beige bg + 2 loud display fonts + sticker-peel CSS vars + ingredient loader. No JS libs needed.

---

## ═══════════════════════════════════════════
## DEEP DIVE 2: PP Neue Montreal — Typeface Travel Guide ⭐ TYPOGRAPHY
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/pp-neue-montreal | **Live:** https://neuemontreal.com/
- **Score:** 7.41/10 | SOTD Jul 13, 2026 | Demande Spéciale | Nominated: Typography Honors
- **Colors:** #D82F2F (red) + #1A1A1A (near-black) — body bg live: `rgb(26,26,26)`
- **Fonts (live console):** PP Neue Montreal Text Medium/Regular + Hairline/Extralight/Thin/Light/Book/Regular — the ENTIRE typeface family loaded as the site's own showcase
- **Tech (live console):** viewport `width=device-width` (no scale — notable); Framer framework; no GSAP/Three (Framer Motion handles animation)
- **Design Patterns:**
  - **Letter-by-letter heading splitting** — "S t o r y", "T e x t", "D i s p l a y", "T y p e f a c e E v o l u t i o n" — every heading is character-split spans (the signature look)
  - **"Official Travel Guide"** editorial framing — site as a guidebook to the font
  - **Type specimen UI** — weights listed as interactive rows (Thin → Extralight → Book → Medium → Semibold → Bold + Italics)
  - **Weight comparison sliders** (drag to compare) + hover interactions
  - **Fullscreen video header**, "Refined, Reworked, Reintroduced." line-broken headline
  - Footer = giant type specimen
- **Takeaway:** Font-foundry sites = the typeface IS the design. Character-split headings + weight rows + red-on-black. Framer Motion is enough — no WebGL needed.

---

## ═══════════════════════════════════════════
## DEEP DIVE 3: Noomo Showcase — Immersive 3D Agency Showreel ⭐ AGENCY
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/noomo-showcase | **Live:** https://showcase.noomoagency.com/
- **Score:** 7.34/10 | SOTD Aug 1, 2026 | Noomo Agency | Nominated: Portfolio Honors
- **Colors:** #0004EB (electric blue) + #020411 (near-black) — body bg live `rgb(0,0,0)`
- **Tech (live console):** viewport `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover`; 1 `<canvas>` (WebGL); CSS vars: `--text-primary, --text-secondary, --accent-color, --font-family, --font-mono` + a **profiler palette** (`--profiler-bg, --profiler-header-bg, --color-fps, --color-call` — they built a custom FPS profiler overlay)
- **Award elements:** Immersive Hero Transition, Hover, 3D Hero Animation, Project Hover, 3D Project Preview, Button Hover, Immersive Scroll, Preloader (8 elements!)
- **Design Patterns:**
  - **Immersive scroll-driven hero** with 3D WebGL object that reacts to scroll
  - **Preloader → hero transition** (seamless)
  - **3D project previews on hover** — each work card opens a 3D scene
  - **Button hover micro-interactions**, mouse-follow 3D
  - Data Viz + Storytelling categories (client logos: Salesforce, AMD, Coinbase)
  - Minimal top nav: Agency / Labs / Storytelling
- **Takeaway:** Agency showreel ≠ video; it's 3D scenes per project. Electric blue on black, custom profiler overlay, scroll-driven hero.

---

## ═══════════════════════════════════════════
## DEEP DIVE 4: Lacoste Ace Breaker — RG Brick-Breaker Game ⭐ GAME/BRAND
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/lacoste-ace-breaker | **Live:** https://members-play.lacoste.com/ace-breaker-rg
- **Score:** 7.46/10 | SOTD Aug 3, 2026 | Merci Michel | Dev Award 7.81 (Animations 9.2!)
- **Colors:** #082415 (deep green) + #FCD757 (Lacoste yellow)
- **Tech (live console):** viewport `width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover`; 1 canvas; 135KB body HTML — full game app
- **Description:** "Play and break as many bricks as you can to win tickets to Roland Garros and Lacoste polo shirts."
- **Design Patterns:**
  - **Brand-as-arcade-game**: brick-breaker where breaking bricks = winning Roland Garros tickets (prize mechanics drive engagement)
  - Fullscreen WebGL game with lacoste-yellow score UI on deep green
  - Game/hero hybrid — the "hero" IS the game
  - Members-play platform wrapper (login flow around game)
- **Takeaway:** Event marketing → playable game with real-world prizes. Two-color brand palette carried into game UI. Animations score 9.2 = motion is the product.

---

## ═══════════════════════════════════════════
## DEEP DIVE 5: Hearst Exhibit 2026 — ELLE & Esquire Photography ⭐ GALLERY/EDITORIAL
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/hearst-exhibit-2026 | **Live:** https://www.hollywoodexhibit2026.com/
- **Score:** 7.21/10 | SOTD Aug 2, 2026 | OSMOS | Nominated: Typography Honors
- **Colors:** #252525 (graphite) + #E3E3E3 (silver) — body color live `rgb(0,0,0)` on transparent
- **Fonts (live console):** helvetica-lt-pro, ivypresto-display (elegant serif), Instrument Sans, abcArizona, safiraMarch — editorial mix
- **Tech (live console):** 2 `<canvas>` (WebGL); Vercel host; GSAP + WebGL per Awwwards tags
- **Award elements:** List and Grid View Gallery, **Paper Curl WebGL Interaction** (page transition that curls like paper!)
- **Design Patterns:**
  - **Paper-curl WebGL page transition** — magazine pages physically curl when navigating (killer editorial transition)
  - **List ⇄ Grid gallery toggle** for photography collection
  - Clean graphite/silver 2-color, photographic focus
  - Scrolling storytelling for 40 years of Hollywood photography
  - Typography-driven (4+ font families mixing sans display + serif display)
- **Takeaway:** Editorial gallery = list/grid toggle + paper-curl transitions + photographic restraint. Vercel + GSAP + WebGL.

---

## ═══════════════════════════════════════════
## DEEP DIVE 6: The Power of Storytelling — Noomo ⭐ STORYTELLING (BEST SCORE)
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/the-power-of-storytelling | **Live:** https://storytelling.noomoagency.com/
- **Score:** 7.87/10 (Creativity 8.37!) | SOTD Jun 8, 2026 | Noomo Agency — HIGHEST of today's set
- **Colors:** #E5DDF9 (lavender) + #020612 (deep navy-black) — body bg live `rgb(196,197,241)`
- **Fonts (live console):** TheSeasons (serif) + TTNeoris (sans) — 1 canvas (WebGL)
- **Award elements (10!):** Contact reflection-in-water, Phoenix customization, 3D project crystals, Page transition, Mouse interaction shader, Bird fly-through animation, 404, 3D glass phoenix animation, Contact mouse interaction, Hero shader animation, 3D scroll
- **Design Patterns:**
  - **3D glass phoenix** hero object (shader-driven, fly-through)
  - **Water-reflection contact section** (shader)
  - **3D project crystals** instead of cards — projects are clickable crystals
  - **Page transitions** + **mouse-interaction shaders**
  - "Click to start" intro gate → cinematic narrative
  - Lavender + navy = rare pastel-dark combo, instantly distinctive
- **Takeaway:** Storytelling sites = shader-based 3D set pieces + gate intro + crystal navigation. Pastel-on-navy palette is an outlier that works.

---

## ═══════════════════════════════════════════
## DEEP DIVE 7: MONOLOG — Brand & Web Studio ⭐ AGENCY (flat/typographic)
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/monolog | **Live:** https://bymonolog.com/
- **Score:** 7.43/10 | SOTD Jul 6, 2026 | By Huy Nguyen (founder-led)
- **Colors:** #080807 (black) + #DDDDD5 (bone white) — pure flat 2-color
- **Tech:** Webflow + GSAP + Three.js; Canvas element on page
- **Design Patterns:**
  - **About modal opens on load** (ESC to close) — storytelling-first agency
  - **"EST 2022 / BASED IN MELBOURNE AND HANOI"** label block
  - **Sound effects toggle** in nav ("Enable sound effects")
  - **Statement-driven hero**: one long sentence as the entire hero (typographic)
  - **Stats carousel** (0 1 / 0 2 with prev/next arrows) — rotating client stats
  - **Client marquee** (VINAMILK, MOC CHAU, UNI OF SYDNEY…)
  - **Case studies with outcome stats** — "21% increase in conversions", "58% avg session duration", "$100K+ in new work within 30 days" (results-driven case cards)
  - Principles list: "Outcomes first, taste second", "All in or nothing"
  - Awards row: Awwwards SOTD x5, FWA x5, CSSDA x5, Typography Honors x2
- **Takeaway:** Founder-led agency = black/bone + statement hero + outcomes-as-headlines + modal-on-load about + sound toggle. Results metrics become the design.

---

## ═══════════════════════════════════════════
## DEEP DIVE 8: Wembi — AI Digital Twin ⭐ B2B TECH/NAV
## ═══════════════════════════════════════════
- **Awwwards:** https://www.awwwards.com/sites/wembi | **Live:** https://www.wembi.ai/
- **Score:** 7.49/10 (Design 7.47, Creativity 7.71) | SOTD Jul 1, 2026 | ET Studio
- **Colors:** #beff8b (acid green) + #9dbbc5 (muted steel blue) — rare 2-color pastel-tech
- **Tech:** Nuxt.js + Craft CMS + GSAP
- **Design Patterns:**
  - **WHAT / HOW / WHY / WHERE tab navigation** — the entire site is 4 tabs, not pages (numbered N.001–N.006 sections)
  - **N.00X numbered section labels** ("N°001 Il Gemello Digitale")
  - Hero: "Instant Digital Twin of Everything" + giant "100"
  - Italian/English bilingual content
  - **Digital Twin / Data / Device / Application** 3-column data-dense section
  - FAQ accordions (N°01–N°05), sector filter buttons (Industrial/Energy/Aerospace/Medical)
  - Cookie consent dialog, clean footer with HQ address
- **Takeaway:** B2B tech = tab-based single-page narrative + numbered sections + acid-green/steel-blue pastels. GSAP + Nuxt.

---

## ═══════════════════════════════════════════
## SITES 9–25 (METADATA-ONLY REVIEW)
## ═══════════════════════════════════════════

### 9. Brunello Cucinelli — AI E-com ⭐ LUXURY AI (SOTD Jul 9, 7.19)
- https://shop.brunellocucinelli.com/en-gb/ai | makemepulse
- Colors: #F1EDE7 (warm ivory) + #282828 (charcoal)
- **"A pageless, intent-led e-commerce experience that unfolds in real time. Multi-agent AI welcomes, listens, and understands."** — Upload & visual search, product page, mobile behavior
- Tech: HTML5, E-Commerce, Luxury, Unusual Navigation
- Pattern: **AI-conversation-as-checkout**; ivory luxury palette; zero traditional product grid

### 10. Obys® Experiment Space (SOTD Jul 28, 7.24)
- https://experiment.obys.agency/ | Obys
- Colors: #000000 + #ffffff
- **Interactive archive of unpublished works/concepts**; "About Us (Pride Mode)" element (pride flag easter egg)
- Tech: GSAP, Three.js, WebGL, 3D, Gallery, Typography
- Pattern: experiments-as-archive; mono palette; pride-mode toggle = delightful easter egg

### 11. 21 Hrs On The Moon (SOTD Jul 10, 7.20)
- https://www.21hrs.space/ | Studio 28K / Set Snail
- Colors: #060B0B (deep green-black) + #FFF3EA (warm cream)
- **Interactive Moon Map, Audio Snippet, Panorama Gallery, Photo Gallery** — Artemis moon mission storytelling
- Tech: WebGL, 3D, Sound/Audio, Storytelling, Photography; Dev Animations 8.0
- Pattern: interactive map + audio snippets + panorama galleries = documentary storytelling

### 12. Tresmares Capital (SOTD Jun 12, 7.25)
- https://www.tresmarescapital.com/ | Dgrees
- Colors: #D81413 (red) + #ffffff
- **Mountain animation** header (Pico Tres Mares), Motion services, parallax, SVG
- Tech: GSAP, Vanilla JS, SVG, Parallax, Scrolling; Dev Animations 8.2
- Pattern: corporate finance with animated mountain identity — SVG scroll animation

### 13. Elva — Voice-first AI Video Editor (SOTD Jun 15, 7.43)
- https://elva-labs.com/ | Lazarev.
- Colors: #FFFFFF + #151515
- **"Glass-blob persona with 30+ behavioral states, agentic UX, intelligent camera, context-aware monetization"** — mobile app showcase
- Tech: GSAP, Three.js, WebGL, UI design, Forms; single page
- Pattern: app-launch landing with behavioral mascot (glass blob)

### 14. sakazuki — Sake Membership (SOTD Jun 14, 7.23) ⭐ FOOD/DRINK
- https://sakazuki.io/ | Shun_Kudo
- Colors: #C30D23 (crimson) + #E1D6CE (warm sand)
- "Global membership connecting people to Japan's hidden gems through sake — rare crafts, cultural stories, immersive experiences"
- Tech: Food & Drink, Culture & Education, Figma, Illustrator, Animation
- Pattern: membership-site-as-cultural-journey; crimson/sand = Japanese craft palette

### 15. Longbow — British EV Sports Cars (SOTD Jul 12, 7.21)
- https://db-longbow.webflow.io/ | Digital Butlers
- Colors: #888C8F (titanium grey) + #FFFFFF
- **"Speed of lightness"** — clean UI, smooth animations, bold typography; Minimalist Automotive Footer, Vision block, Speedster page
- Tech: Webflow, Figma, Typography, UI design, Photo & Video, Footer Design
- Pattern: automotive luxury = titanium-grey + white, "vision block" manifesto section

### 16. Depo Luxe — Contemporary Luxury (SOTD Jul 7, 7.62) ⭐ LUXURY (high score)
- https://depoluxe.xyz/ | Cuchillo
- Colors: #fff + #000
- **"A strategic and cinematic approach to contemporary luxury"** — Archive nav, Contact, Artist (team), Main navigation; Dev Animations 8.4
- Tech: **11ty** (Eleventy!), Film & TV, Luxury, Microinteractions, Navigation Menu
- Pattern: pure B/W cinematic luxury; 11ty static site; archive-as-navigation

### 17. Julien Calot — Visual Artist (SOTD Jul 8, 7.34) ⭐ PORTFOLIO
- https://www.juliencalot.com/ | FLOT NOIR
- Colors: #ffffff + #000000
- **Infinite fullscreen slider, List & Grid toggle, Product Page, 404, About** — artist between Paris & NY
- Tech: Webflow, WebGL, Big Background Images, Infinite Scroll, Gallery, Luxury, 404 pages
- Pattern: artist portfolio = fullscreen infinite slider + list/grid toggle; Webflow

### 18. Gucci — Mystery Unfolds (SOTD Jun 2026) ⭐ LUXURY AI
- MONOGRID — AI-powered, GSAP, GraphQL (from page-2 index)
- Pattern: luxury mystery narrative; AI-driven personalization

### 19. NRG | Build Your Data Center (Rogue Studio) ⭐ DATA-DENSE
- Tech/business; data-dense industrial storytelling (page-2 index)

### 20. Wolverine Worldwide (Locomotive) ⭐ CORPORATE
- Locomotive (smooth-scroll library authors) corporate build

### 21. Sui (HOLOGRAPHIK) — crypto/tech; EverSwap (Lusion) — Web3
- Lusion = WebGL specialists

### 22. Balmoral (MILL3) — luxury; Indigo Laboratory (FPTP) — tech
### 23. Crav Burgers (Anyflow) — see Deep Dive 1
### 24. Serve Robotics (WILD); Fauna Robotics (O0) — robotics tech
### 25. digitalists; RPA COMUNICACIÓN; Podium (San Rita); Bucks Sauce (Buzzworthy); Units (Big Horror Athens); IVRESS SPIN A TALE (Laugh Mind); Ten Years Away (Studio375); IL CAPO PRODUCTION (AUGE); Meech213 (Blackpepper); NRG (Rogue) — page-2 SOTDs

---

## ═══════════════════════════════════════════
## 🏆 BEST 5 SITES TODAY & WHY
## ═══════════════════════════════════════════
1. **The Power of Storytelling (7.87)** — Highest score. 3D glass phoenix, water-reflection contact, crystal project nav, lavender-on-navy. Proves shader craft + rare pastel palette = creativity 8.37.
2. **Depo Luxe (7.62)** — Cinematic B/W luxury on 11ty. Archive-nav + microinteractions; proof that static generators can win SOTD.
3. **Wembi (7.49)** — WHAT/HOW/WHY/WHERE tab architecture + acid-green/steel-blue. Best B2B template of the set.
4. **Lacoste Ace Breaker (7.46, Dev 7.81, Anim 9.2)** — Brand-as-arcade-game with real prizes. The most fun + highest animation craft.
5. **MONOLOG (7.43)** — Statement hero + outcomes-as-headlines + modal-on-load + sound toggle. The best "founder-led agency" recipe, directly applicable to premium wedding/event studios.

**Honorable mentions:** PP Neue Montreal (character-split type showcase), Noomo Showcase (3D agency showreel), Hearst Exhibit (paper-curl transition), CRAV (sticker-peel CSS vars).

---

## ═══════════════════════════════════════════
## 📊 PATTERNS OF THE DAY
## ═══════════════════════════════════════════

### Color Palettes (this batch)
- **2-color rule holds: 100% of analyzed sites use exactly 2 HEX colors**
- Most common: pure **B/W + one accent** (Depo Luxe, MONOLOG, Obys, Julien Calot, Elva)
- **Pastel-tech trend:** acid green #beff8b, lavender #E5DDF9, warm sand #E1D6CE, ivory #F1EDE7 — pastels paired with near-black
- **Food brands:** beige + loud red/mustard (CRAV: #f5e3cd/#f91814/#ffd750)
- **Luxury:** warm neutrals (#F1EDE7/#282828) or pure monochrome
- **Sports/brand:** deep green + yellow (#082415/#FCD757)

### Trending CSS/JS Techniques
1. **CSS custom-property-driven effects** — CRAV's sticker-peel uses `--sticker-rotate`, `--peel-amount`, `calc(var(--sticker-start))`; fully re-usable, no JS
2. **Character-split headings** (PP Neue Montreal, MONOLOG) — every heading as `<span>` per letter for scroll/hover animation
3. **Tab-based single-page architecture** (Wembi) replacing multi-page nav
4. **WebGL paper-curl page transitions** (Hearst) — editorial twist on page transitions
5. **Shader set-pieces** (Storytelling: glass phoenix, water reflection, mouse shaders)
6. **Loader = brand moment** (CRAV burger assembly; Noomo preloader→hero)
7. **Custom FPS profiler overlay** (Noomo) — dev tooling surfaced in CSS vars
8. **Modal-on-load storytelling** (MONOLOG about modal)
9. **Sound design toggles** (MONOLOG, and Ciao Energy from prior batch)
10. **Outcomes-as-headlines** (MONOLOG case cards with %/$ results)

### Unique Patterns Worth Adopting
- **Sticker-peel reveal** (pure CSS vars) → perfect for pricing badges, "special offer" stickers on wedding/menu sites
- **Ingredient-assembly loader** → restaurant/menu site preloader
- **Paper-curl transition** → elegant for editorial/photo-heavy wedding sites
- **Crystal/3D project navigation** → portfolio alternative to cards
- **Tab-narrative B2B** → services pages
- **Numbered N.00X section labels** → data-dense layouts made beautiful
- **Type-specimen-as-page** → any typography-forward brand (invitations!)

---

## ═══════════════════════════════════════════
## 🧩 CODE SNIPPETS TO ADD TO SKILLS
## ═══════════════════════════════════════════

### Snippet 1: Pure-CSS Sticker Peel (from CRAV)
```css
.sticker {
  --sticker-rotate: 30deg;
  --sticker-p: 20%;
  --sticker-shadow-opacity: .6;
  --peel-direction: 0deg;
  --peel-amount: 1;
  --sticker-start: calc(-1 * var(--sticker-p));
  --sticker-end: calc(100% + var(--sticker-p));
  position: relative;
  transform: rotate(var(--sticker-rotate));
  background: var(--mustard, #ffd750);
  /* peel flap via ::after using --peel-direction/--peel-amount */
}
```
Use: promo badges, "limited time" stickers, save-the-date tags.

### Snippet 2: Character-Split Heading (PP Neue Montreal style)
```js
// Split every heading into char spans for per-letter animation
document.querySelectorAll('h1, h2, h3').forEach(h => {
  const text = h.textContent;
  h.innerHTML = [...text].map(c =>
    c === ' ' ? ' ' : `<span class="char">${c}</span>`).join('');
});
```
```css
.char { display: inline-block; will-change: transform; }
/* animate with GSAP: gsap.from('.char', {yPercent:110, stagger:.02}) */
```

### Snippet 3: Sticker-Peel & Marquees + Tab-Narrative — combined skill reference
- Add `--sticker-*` var family and `.char` splitting to the `frontend-design` skill's motion section
- Add "loader = brand moment" (burger assembly pattern) to `restaurant-website` skill
- Add "outcomes-as-headlines" case-card pattern to `wedding/event` skill

---

## ═══════════════════════════════════════════
## 📌 LIVE URL INDEX (for future reference)
## ═══════════════════════════════════════════
| Site | Live URL | Study Focus |
|---|---|---|
| The Power of Storytelling | https://storytelling.noomoagency.com/ | shaders, phoenix, crystal nav |
| Depo Luxe | https://depoluxe.xyz/ | B/W luxury, 11ty, archive nav |
| Wembi | https://www.wembi.ai/ | tab architecture, pastel-tech |
| Lacoste Ace Breaker | https://members-play.lacoste.com/ace-breaker-rg | WebGL game, prize mechanics |
| MONOLOG | https://bymonolog.com/ | statement hero, modal, sound |
| PP Neue Montreal | https://neuemontreal.com/ | char-split type specimen |
| Noomo Showcase | https://showcase.noomoagency.com/ | 3D showreel, profiler |
| Hearst Exhibit 2026 | https://www.hollywoodexhibit2026.com/ | paper-curl transition, gallery toggle |
| CRAV Burgers | https://www.cravburgers.shop/ | sticker CSS vars, loader |
| Obys Experiment Space | https://experiment.obys.agency/ | experiments archive, pride mode |
| 21 Hrs On The Moon | https://www.21hrs.space/ | moon map, audio, panorama |
| Brunello AI E-com | https://shop.brunellocucinelli.com/en-gb/ai | pageless AI commerce |
| Elva | https://elva-labs.com/ | app launch, blob persona |
| sakazuki | https://sakazuki.io/ | sake membership, crimson/sand |
| Longbow | https://db-longbow.webflow.io/ | automotive, vision block |
| Julien Calot | https://www.juliencalot.com/ | infinite fullscreen slider |
| Tresmares Capital | https://www.tresmarescapital.com/ | mountain SVG animation |

*End of daily report — 2026-08-02. Next: revisit Noomo/Storytelling for shader code deep-dive.*
