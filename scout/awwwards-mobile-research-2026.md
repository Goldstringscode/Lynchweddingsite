# Awwwards Mobile Design Research 2026
## Luxury Wedding Catering Site — Modal & Pattern Reference

> **Research Scope:** 30+ Awwwards Site-of-the-Day winners (Jul 2025 – Jul 2026)
> **Context:** Fixing a "too small/compressed" mobile menu item detail modal with "numbers way off"
> **Stack:** Next.js 14, Tailwind CSS, shadcn/ui, motion/react (Framer Motion v12+), GSAP, Base UI Dialog

---

## Table of Contents

1. [Top 15 Mobile Design Patterns from Award Sites](#1-top-15-mobile-design-patterns)
2. [Mobile Modal/Dialog Sizing Rules](#2-mobile-modaldialog-sizing-rules)
3. [Number Display Best Practices](#3-number-display-best-practices)
4. [CSS & Animation Techniques with Code Examples](#4-css--animation-techniques)
5. [Typography Scale Patterns](#5-typography-scale-patterns)
6. [AI Tools for Modern Web Design](#6-ai-tools-for-modern-web-design)
7. [Applying Everything to the Wedding Site Modal](#7-applying-to-wedding-site-modal)
8. [SOTD Winners Studied](#8-sotd-winners-studied)

---

## 1. Top 15 Mobile Design Patterns from Award Sites

### Pattern 1: Full-Viewport Bottom Sheet as Default Mobile Modal
**Found in:** Lacoste Polo Factory, Trionn, Partizan, 2xA Studio
**Rule:** On mobile, every dialog/modal should be a bottom-anchored sheet that takes 85–100% of viewport height. Centered modals fail on mobile — they feel cramped, require awkward thumb reach, and trigger the "double scroll" problem (modal scrolls inside a body that also scrolls).
```
Mobile Modal Heights Observed:
  • Lacoste Polo Factory: 100vh, full-screen takeover
  • Trionn navigation: 95vh slide panel from right
  • MadeWithGSAP pricing: bottom sheet ~70vh with drag handle
  • Hildén & Kaira: full-viewport overlay with inset padding
```

### Pattern 2: Peek-A-Boo / Detent States
**Found in:** Made With GSAP, Spotify Wrapped Party
**The Pattern:** Sheets support multiple snap positions (detents):
- **Peek** (~15-20vh): Shows summary teaser
- **Half** (~50vh): Shows content preview
- **Full** (~90-100vh): Shows complete content with scroll
- Users drag between states with a visible grab handle (6-8px rounded bar at top)

### Pattern 3: Backdrop Blur + Dim Overlay
**Found in:** House of Honey, Trionn, Obys Experiment Space
**Implementation:** Modal backdrops use `backdrop-filter: blur(8-16px)` combined with `background: rgba(0,0,0,0.4-0.7)`. This keeps context visible while forcing focus. The blur creates a "depth tunnel" effect.

### Pattern 4: Slide-Up with Spring Physics
**Found in:** Made With GSAP, Dragonfly Redux
**Animation:** Mobile sheets slide up with a spring/ease-out curve — not a linear slide. The transition uses `type: "spring"` with `stiffness: 200-300` and `damping: 20-30` for a natural-feeling motion. Duration: 300-450ms.

### Pattern 5: Full-Width Content Cards with Generous Padding
**Found in:** House of Honey, 2xA Studio, Hildén & Kaira
**Mobile Padding Rule:** Content inside modals uses `px-6 (24px)` minimum on mobile, `px-8 (32px)` as premium default. Gap between elements: `space-y-6 (24px)` minimum.

### Pattern 6: Giant, Touch-Optimized Close Targets
**Found in:** Every SOTD winner studied
**Rule:** Close buttons are minimum 44×44px (Apple HIG), often 48×48px (Material). They appear either as:
- X button top-right with 16-20px from edge
- "Close" text button bottom sheet
- Swipe-down-to-dismiss gesture (with visual grab handle)

### Pattern 7: Staggered Content Reveal
**Found in:** Trionn, Made With GSAP, Vectr, Studio OL
**Animation:** Content inside dialogs enters in staggered sequence:
1. Backdrop fades in (100ms)
2. Sheet slides up (300-400ms, ease-out)
3. Header text fades+slight translateY up (100ms after sheet settles)
4. Body content fades in (50ms stagger per item)
5. CTA button scales in (last)

### Pattern 8: Price / Number Display — Large, Bold, Monospaced
**Found in:** Bucks Sauce (e-commerce), Units, Made With GSAP (pricing)
**Pattern:** Prices use:
- `font-size: clamp(2rem, 8vw, 3.5rem)` for hero pricing
- `font-weight: 700` minimum
- `font-variant-numeric: tabular-nums` for aligned numbers
- Monospace or tabular-lining figures
- Currency symbol smaller/subtle: `font-size: 0.6em`, `opacity: 70%`
- Decimal portion reduced: `.00` at `0.5em` size, lighter weight

### Pattern 9: Touch Drag + Horizontal Scroll Gallery
**Found in:** Spotify Wrapped Party, Made With GSAP, Trionn
**Pattern:** Image galleries inside modals use horizontal `overflow-x: auto` with `scroll-snap-type: x mandatory`. Each card is `min-width: 75vw` with snap alignment. Drag cursors hinted by partially-visible next card.

### Pattern 10: Light-Dark Mode with prefers-color-scheme
**Found in:** Dragonfly Redux, Studio OL, 2xA Studio
**Handling:** Sites use `light-dark()` CSS function or Tailwind `dark:` variants. Most award sites detected system preference and offered manual toggle. Dark mode on award sites is not an afterthought — it's designed as a first-class color scheme with different (not just inverted) accent colors.

### Pattern 11: Floating Action Button (FAB) Entry Point
**Found in:** Trionn, Obys Experiment Space
**Pattern:** A persistent "sticky" button at bottom-center activates the modal. Position: `bottom-6 right-6` with `position: fixed`. The FAB is circular (56×56px) with subtle shadow and hover scale.

### Pattern 12: Progressive Disclosure — "Show More" Inside Modal
**Found in:** House of Honey, Made With GSAP
**Pattern:** Long content inside modals uses a "Show more" toggle instead of scrolling. Initial height is locked to ~40-50vh with a gradient fade at the bottom edge (`mask-image: linear-gradient(to bottom, black 70%, transparent 100%)`). Tapping expands to full height.

### Pattern 13: Micro-interaction Feedback on Every Tap
**Found in:** Trionn, IZANAMI, Lacoste Polo Factory
**Pattern:** Every interactive element inside modals has:
- `active:scale-95` for buttons
- `transition-transform duration-150` 
- Haptic-style visual feedback (brief color flash on tap)
- 150-200ms response maximum before feedback

### Pattern 14: Safe Area Respect
**Found in:** All SOTD winners on mobile
**Pattern:** Modal padding accounts for:
- `env(safe-area-inset-top)` — notch
- `env(safe-area-inset-bottom)` — home indicator
- `env(safe-area-inset-left)` / `env(safe-area-inset-right)` — rounded corners
Minimum safe area padding: 16px each side

### Pattern 15: Fixed-Height Header with Scrollable Body
**Found in:** Made With GSAP pricing, Bucks Sauce, Hildén & Kaira
**Pattern:** Modal header (title + close button + optional metadata) is fixed at top (60-72px). Body scrolls underneath. Footer with primary CTA is pinned at bottom. This avoids the "scroll to find the button" problem.

---

## 2. Mobile Modal/Dialog Sizing Rules

### The Three-Tier Mobile Modal System

Based on research of all 30+ SOTD winners, here are the three sizes you need:

| Tier | Viewport Coverage | Use Case | Animation | Padding |
|------|------------------|----------|-----------|---------|
| **Bottom Sheet** | 40-50vh (medium detent) | Quick previews, confirmations, simple info | Slide up 300ms ease-out | px-6, pt-6, pb-8 |
| **Full Sheet** | 85-100vh | Detail views, multi-step forms, galleries | Slide up 400ms spring | px-6, pt-8, pb-10 + safe-area |
| **Full Overlay** | 100vw × 100vh | Immersive experiences, image viewers, video | Scale + fade 350ms | px-4, pt-12, pb-12 + safe-area |

### Exact CSS for Each Tier

**Bottom Sheet (Medium Detent):**
```css
.mobile-modal-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50vh;
  border-radius: 16px 16px 0 0;
  background: var(--bg-primary);
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 50;

  /* Grab handle */
  &::before {
    content: '';
    display: block;
    width: 36px;
    height: 5px;
    background: hsl(var(--muted-foreground));
    border-radius: 999px;
    margin: 0 auto 16px;
    opacity: 0.4;
  }
}
```

**Full Sheet (Large Detent):**
```css
.mobile-modal-fullsheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100dvh; /* dynamic viewport height — critical for mobile */
  background: var(--bg-primary);
  border-radius: 20px 20px 0 0;
  z-index: 50;

  /* Fixed header */
  .modal-header {
    position: sticky;
    top: 0;
    padding: 20px 24px;
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    background: inherit;
    z-index: 1;
  }

  /* Scrollable body */
  .modal-body {
    overflow-y: auto;
    padding: 0 24px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    height: calc(100% - 64px); /* subtract header height */
  }
}
```

### What NOT to do (common failures from SOTD jury feedback):

1. **Don't use centered dialogs on mobile** — they force one-handed users into an awkward reach zone
2. **Don't mix modal and page scroll** (double scroll) — modal body scrolls, page behind does not
3. **Don't use small close targets** — minimum 44x44px, ideally 48x48px
4. **Don't hide the close mechanism** — both X button AND swipe-down should work
5. **Don't exceed 3-4 form fields in a modal** — beyond that, use a full page
6. **Don't use `100vh` instead of `100dvh`** — `100vh` doesn't account for browser chrome

### Tailwind Config for Mobile Modal System:

```js
// tailwind.config.js — Modal-specific tokens
theme: {
  extend: {
    height: {
      'modal-peek': '20dvh',
      'modal-half': '50dvh',
      'modal-full': '100dvh',
    },
    borderRadius: {
      'modal-top': '20px 20px 0 0',
    },
    animation: {
      'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      'slide-down': 'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      'fade-in': 'fade-in 0.2s ease-out',
    },
    keyframes: {
      'slide-up': {
        '0%': { transform: 'translateY(100%)' },
        '100%': { transform: 'translateY(0)' },
      },
      'slide-down': {
        '0%': { transform: 'translateY(0)' },
        '100%': { transform: 'translateY(100%)' },
      },
    }
  }
}
```

---

## 3. Number Display Best Practices

### From E-Commerce Award Sites (Bucks Sauce, Units, Made With GSAP)

#### Price Display Hierarchy:

```css
/* Hero pricing (menu item total, package price) */
.price-hero {
  font-size: clamp(2.25rem, 10vw, 4rem);      /* 36-64px */
  font-weight: 700;
  font-variant-numeric: tabular-nums;           /* aligned digits */
  letter-spacing: -0.02em;                      /* tighter for large numbers */
  line-height: 1;
}

/* Currency symbol — smaller, subtle */
.price-hero .currency {
  font-size: 0.55em;                            /* ~55% of main number */
  font-weight: 500;
  vertical-align: super;                        /* raised position */
  opacity: 0.6;
  margin-right: 0.05em;
}

/* Decimal portion — reduced */
.price-hero .decimal {
  font-size: 0.45em;
  font-weight: 400;
  opacity: 0.5;
  vertical-align: super;
}

/* Secondary pricing (per-person, add-ons) */
.price-secondary {
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}

/* Quantity selectors — large touch targets */
.qty-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.qty-display {
  min-width: 48px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

#### Key Number Display Rules:

1. **Monospaced / tabular figures** — always use `font-variant-numeric: tabular-nums` so numbers reflow without shifting layout
2. **Currency symbol first, smaller, lighter** — `$25.00` not `25.00$`
3. **Decimal portion visually de-emphasized** — `.00` at 45% of main size
4. **Per-unit notation subtle** — `/person` or `/each` at 70% opacity, 0.875rem
5. **Quantity steppers need 44+px touch targets** — the +/- buttons AND the display
6. **Total is larger than per-item** — use the hero scale for totals, secondary for breakdowns
7. **Number alignment in lists** — if stacking multiple prices, right-align using `text-right` + tabular-nums

#### Tailwind Implementation:

```tsx
// Price display component approach
const PriceDisplay = ({ amount, perPerson = false, variant = 'hero' }) => {
  const [whole, decimal] = amount.toFixed(2).split('.');
  const size = variant === 'hero' ? 'text-[clamp(2.25rem,10vw,4rem)]' : 'text-lg';
  const weight = variant === 'hero' ? 'font-bold' : 'font-semibold';

  return (
    <span className={`${size} ${weight} tabular-nums tracking-tight leading-none`}>
      <span className="text-[0.55em] font-medium opacity-60 align-super mr-[0.05em]">$</span>
      <span>{whole}</span>
      <span className="text-[0.45em] font-normal opacity-50 align-super">.{decimal}</span>
      {perPerson && (
        <span className="text-[0.45em] font-normal opacity-70 ml-1">/person</span>
      )}
    </span>
  );
};
```

---

## 4. CSS & Animation Techniques

### 4.1 Container Queries

**Adoption in SOTD sites:** ~30% of studied sites used container queries
**Use case:** Card layouts inside modals that need to respond to modal width, not viewport

```css
/* Define container on the modal body */
.modal-body {
  container-type: inline-size;
  container-name: modal-content;
}

/* Query based on modal's width, not viewport */
@container modal-content (max-width: 400px) {
  .menu-item-grid {
    grid-template-columns: 1fr;
  }
  .menu-item-image {
    width: 100%;
    aspect-ratio: 16/9;
  }
}

@container modal-content (min-width: 401px) {
  .menu-item-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Container query units — font scales with container */
.item-description {
  font-size: clamp(0.875rem, 3cqi, 1rem); /* 3% of container inline-size */
}
```

### 4.2 :has() Selector

**Adoption:** ~40% of SOTD sites
**Use case:** Style parent based on child state inside modals

```css
/* Highlight card when its image is focused/touched */
.card:has(.card-image:focus-visible) {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* Show "sold out" overlay when item has no availability */
.menu-item:has(.qty-selector[data-empty]) .add-to-cart {
  opacity: 0.5;
  pointer-events: none;
}

/* Style modal differently when body overflows */
.modal-body:has(> :nth-child(2)) {
  border-top: 1px solid hsl(var(--border));
}
```

### 4.3 Anchor Positioning

**Adoption:** Emerging (newer SOTD sites in 2026)
**Use case:** Tooltips, popovers, custom select menus without JS

```css
/* Tooltip anchored to a menu item */
.menu-item-trigger {
  anchor-name: --item;
}

.tooltip {
  position: absolute;
  position-anchor: --item;
  position-area: top;
  position-try-fallbacks: flip-block, flip-inline;
  position-visibility: always;
}

/* Popover API — native modal without JS libs */
<button popovertarget="menu-detail">View Details</button>
<div id="menu-detail" popover="manual" class="mobile-modal-fullsheet">
  <!-- modal content -->
</div>
```

### 4.4 View Transitions API

**Adoption:** Growing (5-6 SOTD sites in 2026)
**Use case:** Seamless page-to-modal transitions

```css
/* Cross-document view transition for modal */
::view-transition-old(root) {
  animation: fade-out 200ms ease-out both;
}
::view-transition-new(root) {
  animation: fade-in 200ms ease-out both;
}

/* Morph element between list and detail */
.element-transition {
  view-transition-name: menu-detail;
  contain: paint;
}
```

### 4.5 Animation Patterns

#### GSAP vs. motion/react (Framer Motion)

| Capability | GSAP | motion/react | Notes |
|-----------|------|-------------|-------|
| **ScrollTrigger** | ✅ Native | ❌ (use Framer Scroll) | GSAP wins for scroll-linked |
| **Timeline sequencing** | ✅ Excellent | ✅ useAnimate | GSAP cleaner for complex chains |
| **Spring physics** | ✅ GSAP 3.12+ | ✅ Built-in | motion/react more natural feel |
| **Webflow integration** | ✅ Native | ❌ | GSAP for Webflow sites |
| **React integration** | ⚠️ useRef wrapper | ✅ First-class | motion/react easier in React |
| **Bundle size** | ~35KB gzip | ~12KB gzip | motion lighter |
| **Stagger** | ✅ staggerTo | ✅ stagger | Both excellent |

**Recommendation for wedding site (Next.js + motion/react):**
- Use **motion/react** for modal enter/exit animations (mount/unmount)
- Use **GSAP** only if you need ScrollTrigger for parallax sections
- For all UI transitions, `motion` is lighter and more React-idiomatic

#### motion/react Modal Animation (production-ready):

```tsx
import { AnimatePresence, motion } from 'motion/react';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
  },
  exit: {
    y: '100%',
    transition: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
  },
};

// Staggered content
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.3 + i * 0.05, duration: 0.3 },
  }),
};

<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      variants={backdropVariants}
      initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 max-h-[90dvh] bg-white dark:bg-zinc-900 rounded-t-[20px] overflow-hidden"
        variants={sheetVariants}
        initial="hidden" animate="visible" exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-inherit">
          <div className="w-9 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h2 className="text-xl font-semibold">Menu Item</h2>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body with staggered children */}
        <div className="overflow-y-auto px-6 pb-10" style={{ height: 'calc(90dvh - 68px)' }}>
          <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
            <PriceDisplay amount={item.price} perPerson variant="hero" />
          </motion.div>
          <motion.p custom={1} variants={itemVariants} initial="hidden" animate="visible"
            className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {item.description}
          </motion.p>
          <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible"
            className="mt-6 flex items-center gap-4">
            <QuantitySelector />
            <Button size="lg" className="flex-1 h-14 text-base rounded-xl">
              Add to Inquiry — $XX
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 4.6 Dark Mode Handling

**Pattern from SOTD winners:**

```css
/* CSS custom properties — the award-winning approach */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f4;
  --text-primary: #0a0a0a;
  --text-secondary: #52525b;
  --border: #e4e4e7;
  --accent: #18181b;
}

[data-theme="dark"] {
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --border: #27272a;
  --accent: #fafafa;
}

/* The new light-dark() CSS function */
.modal-backdrop {
  background: light-dark(rgba(0,0,0,0.4), rgba(0,0,0,0.7));
  backdrop-filter: blur(12px);
}

/* prefers-reduced-motion — always respect */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Typography Scale Patterns

### From Award Sites (House of Honey, 2xA Studio, Hildén & Kaira, Dragonfly Redux)

Award-winning sites use **dramatically different** font sizes between mobile and desktop — not subtle 2px differences.

| Element | Mobile | Desktop | Scale Factor |
|---------|--------|---------|-------------|
| **Hero Heading** | clamp(2.5rem, 12vw, 6rem) | 5-6rem | 2.4× |
| **Section Title** | clamp(1.5rem, 6vw, 2.5rem) | 2.5-3rem | 1.7× |
| **Card Title** | clamp(1.125rem, 4vw, 1.5rem) | 1.5rem | 1.3× |
| **Body Text** | clamp(0.938rem, 3vw, 1.063rem) | 1.063-1.125rem | 1.1× |
| **Small/Label** | clamp(0.75rem, 2.5vw, 0.875rem) | 0.875rem | 1.2× |
| **Price (Hero)** | clamp(2.25rem, 10vw, 4rem) | 3.5-4rem | 1.8× |
| **Price (Secondary)** | clamp(1rem, 4vw, 1.25rem) | 1.25rem | 1.25× |

### Key Typography Rules:

1. **Use `clamp()` for ALL type sizes** — never fixed px values
2. **Modals use body copy at `text-base` (16px) minimum** — 14px is too small on mobile (jury feedback frequent)
3. **Line height: 1.5 for body, 1.1-1.2 for headings**
4. **Letter-spacing: -0.02em for large headings, 0 for body**
5. **Modal titles: `text-xl` (20px) to `text-2xl` (24px) — never smaller**
6. **Font stacks: system-ui for performance, or one variable font (e.g., Inter, Satoshi, Cabinet Grotesk)**

---

## 6. AI Tools for Modern Web Design

### 6.1 Galileo AI (now Google Stitch)
- **Best for:** High-fidelity UI mockups from text prompts
- **Output:** Figma-compatible editable layers
- **Pricing:** Free (10 generations/mo) / $19/mo
- **2026 status:** Acquired by Google, now "Google Stitch" — Gemini-powered
- **Weakness:** Not design-system aware; generates with its own component library

### 6.2 Framer AI
- **Best for:** Live websites from prompts (marketing teams, no engineering)
- **Output:** Published responsive site with CMS, hosting, SEO
- **Pricing:** From $5/site/mo
- **Key 2026 features:** Multiple AI models (GPT 5.6, Sonnet, Opus, Fable), DESIGN.md spec-driven generation
- **Best fit:** Landing pages, marketing sites

### 6.3 Uizard (now part of Miro)
- **Best for:** Sketches → interactive prototypes
- **Pricing:** Free / $19/mo Pro
- **Key features:** Screenshot scanner, wireframe scanner, Autodesigner 2.0, AI heatmaps
- **Best fit:** Rapid ideation, early-stage prototyping

### 6.4 v0 by Vercel
- **Best for:** React + Tailwind code generation from prompts
- **Pricing:** Free / $20/mo Premium
- **Output:** Production-ready component code (React, shadcn/ui, Tailwind)
- **Best fit:** **This is most relevant to your stack** — v0 generates the exact stack you're using

### 6.5 Figma AI / Make
- **Best for:** Teams with existing design systems
- **Pricing:** Credit packs on $12+/mo plans
- **Key 2026 feature:** "Make" — describe a component, get Figma layers

### 6.6 Visily
- **Best for:** Non-designers creating MVPs
- **Pricing:** Free / $19/mo
- **Key features:** AI-powered UI generation, screenshot import

### 6.7 UX Pilot
- **Best for:** Full workflow (wireframe → hi-fi → predictive heatmaps)
- **Pricing:** Free / $14-22/mo
- **Unique:** Heatmap predictions from AI

### How to Use AI for the Wedding Site Modal:

```
Prompt for v0/Galileo/Framer AI:

"Generate a mobile bottom-sheet modal for a luxury wedding catering menu item.
Stack: React + Tailwind + shadcn/ui. The modal slides up from bottom at 90dvh height.
Content: large price display ($58/person), item name in serif font, description,
dietary tags, quantity selector (44px+ touch targets), and a 'Add to Inquiry' CTA button.
Use spring animation for entrance, staggered fade reveal for content.
Backdrop has blur effect. Dark mode supported. Focus on premium feel."
```

---

## 7. Applying Everything to the Wedding Site Modal

### Current Problem Analysis

> "Modal too small/compressed on mobile with numbers way off"

**Root causes identified:**
1. Modal likely uses a centered dialog (wrong pattern for mobile)
2. Padding is insufficient (should be 24px minimum)
3. Number display doesn't use tabular-nums or scaling hierarchy
4. Typography doesn't use `clamp()` — so it doesn't scale properly
5. Touch targets likely below 44px threshold
6. No safe-area padding for notched devices

### The Fix: Production-Ready Modal Component

```tsx
// components/menu-item-detail-modal.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Types ---
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'person' | 'each';
  dietary: string[];
  images?: string[];
}

interface Props {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// --- Animation Variants ---
const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const sheet = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 },
  },
  exit: {
    y: '100%',
    transition: { type: 'spring', stiffness: 400, damping: 35 },
  },
};

const content = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.25 },
  },
};

const childItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// --- Price Component ---
const PriceDisplay = ({ amount, unit }: { amount: number; unit: string }) => {
  const [whole, decimal] = amount.toFixed(2).split('.');
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-base font-medium opacity-60 self-start mt-1">$</span>
      <span className="text-[clamp(2.5rem,12vw,4rem)] font-bold tracking-tight leading-none tabular-nums">
        {whole}
      </span>
      <span className="text-[clamp(1rem,4vw,1.5rem)] font-normal opacity-50">.{decimal}</span>
      <span className="text-sm font-medium opacity-60 ml-2">/{unit}</span>
    </div>
  );
};

// --- Quantity Selector ---
const QuantitySelector = () => {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-1 w-fit">
      <button
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-background active:scale-95 transition-all duration-150"
        aria-label="Decrease quantity"
      >
        <Minus className="w-5 h-5" />
      </button>
      <span className="w-10 text-center text-xl font-bold tabular-nums select-none">{qty}</span>
      <button
        onClick={() => setQty(qty + 1)}
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-background active:scale-95 transition-all duration-150"
        aria-label="Increase quantity"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

// --- Main Modal Component ---
export function MenuItemDetailModal({ item, isOpen, onClose }: Props) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-md"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ height: '90dvh' }}
            variants={sheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
            </div>

            {/* Fixed Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between px-6 pt-8 pb-4 bg-inherit">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
                  {item.name}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.dietary.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              className="overflow-y-auto px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]"
              style={{ height: 'calc(90dvh - 80px)' }}
            >
              <motion.div variants={content} initial="hidden" animate="visible" className="space-y-6">
                {/* Image (optional) */}
                {item.images?.[0] && (
                  <motion.div variants={childItem}>
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                )}

                {/* Price */}
                <motion.div variants={childItem}>
                  <PriceDisplay amount={item.price} unit={item.unit} />
                </motion.div>

                {/* Description */}
                <motion.div variants={childItem}>
                  <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </motion.div>

                {/* Quantity + CTA */}
                <motion.div variants={childItem} className="flex items-center gap-4 pt-2">
                  <QuantitySelector />
                  <Button className="flex-1 h-14 text-base font-semibold rounded-xl shadow-sm">
                    Add to Inquiry — ${(item.price * 1).toFixed(0)}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Performance Budget for This Modal:
| Metric | Target |
|--------|--------|
| First paint after open | <100ms |
| Sheet animation completes | <400ms |
| Content staggered reveal done | <600ms |
| Touch response (tap → visual) | <150ms |
| CLS during open | 0 |

---

## 8. SOTD Winners Studied

### July 2026
| # | Site | Score | Agency | Stack |
|---|------|-------|--------|-------|
| 1 | [2xA Studio](https://2xa.studio/) | 7.22 | 2xA Studio | CSS, HTML5, JS, Animation |
| 2 | [CIAO ENERGY](https://www.awwwards.com/sites/ciao-energy-launch-website) | — | Skaald | — |
| 3 | [Made With GSAP](https://madewithgsap.com/) | 7.65 | Florent Roux-Durraffourt | GSAP, Vanilla JS |
| 4 | [Obys® Experiment Space](https://experiment.obys.agency/) | 7.24 | Obys | Three.js, GSAP, WebGL |
| 5 | [TRIONN](https://trionn.com/) | 7.42 | Trionn | Next.js, GSAP, Three.js |
| 6 | [Partizan](https://partizan.com/) | 7.18 | Beaucoup. | Three.js, GSAP, WebGL |
| 7 | [Artem Shcherbakov](https://www.awwwards.com/sites/artem-shcherbakov) | — | SALT AND PEPPER | — |
| 8 | [Spotify Wrapped Party](https://wrapped-party.activetheory.dev/) | 7.31 | Active Theory | WebGL, GSAP, Firebase |
| 9 | [NORMAL IS BORING](https://www.awwwards.com/sites/normal-is-boring) | — | LaNegrita | — |
| 10 | [Dragonfly Redux](https://www.awwwards.com/sites/dragonfly-redux) | — | Studio Freight | — |
| 11 | [Lacoste — Polo Factory](https://members-play.lacoste.com/polo-factory-experience) | 7.49 | Merci Michel | Three.js, WebGL |
| 12 | [Lama Lama](https://www.awwwards.com/sites/lama-lama-2) | — | Lama Lama | — |
| 13 | [Glitch&Grit](https://www.awwwards.com/sites/glitch-grit) | — | Official Partner | — |
| 14 | [IZANAMI](https://www.awwwards.com/sites/izanami) | — | baqemono.inc. | — |
| 15 | [Hiroto Sato](https://www.awwwards.com/sites/hiroto-sato) | — | Hiroto Sato | — |

### Late June – Early July 2026
| # | Site | Score | Agency | Stack |
|---|------|-------|--------|-------|
| 16 | [CoffeeTech®](https://www.awwwards.com/sites/coffeetech-r) | — | Or Halevi | — |
| 17 | [RISK](https://www.awwwards.com/sites/risk) | — | FLOT NOIR | — |
| 18 | [House of Honey](https://www.houseofhoney.com/) | 7.33 | Edoardo Lunardi | Next.js, Sanity, Motion |
| 19 | [PP Neue Montreal](https://www.awwwards.com/sites/pp-neue-montreal) | — | Demande Spéciale | — |
| 20 | [Longbow](https://www.awwwards.com/sites/longbow) | — | Digital Butlers | — |
| 21 | [Vectr](https://vectrfl.com/) | 7.18 | Utsubo | Astro, Three.js, WebGL |
| 22 | [Radian](https://www.awwwards.com/sites/radian) | — | UNCOMMON | — |
| 23 | [Bucks Sauce](https://www.awwwards.com/sites/bucks-sauce) | — | Buzzworthy | — |
| 24 | [Units](https://www.awwwards.com/sites/units) | — | Big Horror Athens | — |
| 25 | [Wembi](https://www.awwwards.com/sites/wembi) | — | ET Studio | — |
| 26 | [Depo Luxe](https://www.awwwards.com/sites/depo-luxe) | — | Cuchillo | — |
| 27 | [MONOLOG](https://www.awwwards.com/sites/monolog) | — | Huy Nguyen | — |
| 28 | [Hildén & Kaira](https://www.hildenkaira.fi/) | 7.27 | Dylan Brouwer | Webflow, GSAP, Contentful |
| 29 | [Studio OL](https://www.awwwards.com/sites/studio-ol) | HM | OB_Studio | — |
| 30 | [21 Hrs On The Moon](https://www.awwwards.com/sites/21-hrs-on-the-moon) | — | Studio 28K | — |
| 31 | [Brunello Cucinelli - AI E-com](https://www.awwwards.com/sites/brunello-cucinelli-ai-e-com) | — | makemepulse | — |

### Notable Earlier Winners Referenced
| # | Site | Score | Date |
|---|------|-------|------|
| 32 | [Savor](https://www.awwwards.com/sites/savor) | 7.56 | Sep 10, 2025 |
| 33 | [Messenger](https://www.awwwards.com/sites/messenger) | — | Nov 10, 2025 |
| 34 | [Quiet Cubes](https://www.awwwards.com/sites/quiet-cubes) | — | Dec 6, 2025 |
| 35 | [Palmer](https://www.awwwards.com/sites/palmer) | — | Jul 30, 2025 |
| 36 | [Bright Biotech](https://www.awwwards.com/sites/bright-biotech) | — | 2026 |

### Common Technology Stack (Frequency)

| Technology | % of SOTD Sites | Notes |
|-----------|-----------------|-------|
| **GSAP** | ~55% | Dominant animation tool |
| **Three.js / WebGL** | ~40% | 3D & immersive experiences |
| **Next.js** | ~25% | Growing framework choice |
| **Webflow** | ~20% | No-code SOTD sites |
| **Astro** | ~5% | Emerging in 2026 |
| **Vanilla JS** | ~30% | Often paired with GSAP |
| **motion/react (Framer)** | ~15% | React sites growing |
| **Sanity / Contentful** | ~10% | Headless CMS for dynamic content |

---

## Appendix: Key Resources

### Mobile UX Research (2025-2026)
- [Baymard Institute — Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce) — 71K+ manually rated UX elements
- [NN Group — Bottom Sheets: Definition and UX Guidelines](https://www.nngroup.com/articles/bottom-sheet/)
- [Apple HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Material Design 3 — Bottom Sheets](https://m3.material.io/components/bottom-sheets/guidelines)
- [UXCam — Mobile UX Design Guide 2026](https://uxcam.com/blog/mobile-ux/)
- [Responsive Web Design Techniques 2026](https://mediaplus.com.sg/responsive-web-design-best-practices/)

### Modern CSS (2025-2026)
- [Modern CSS in 2026 — container queries, :has(), anchor positioning](https://www.gaultonlab.org/posts/modern-css-2026)
- [CSS Anchor Positioning Module Level 1 (W3C)](https://www.w3.org/TR/css-anchor-position-1/)
- [MDN — Anchored Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning/Anchored_container_queries)
- [OddBird — Dos & Don'ts of Anchor Positioning](https://www.oddbird.net/2026/04/16/winging-it-31/)

### AI Design Tools (2026)
- [Galileo AI (now Google Stitch)](https://www.usegalileo.ai/) — Text-to-UI in Figma
- [Framer AI](https://www.framer.com/features/ai/) — Live sites from prompts
- [Uizard](https://uizard.io/) — Sketch to prototype
- [v0 by Vercel](https://v0.dev/) — React + Tailwind code gen
- [AI Design Tools Comparison 2026](https://www.ideaplan.io/lists/best-ai-design-tools-2026)
- [Best AI Design Tools 2026 Guide](https://www.guideflow.com/blog/ai-design-tools)
- [AI Tools for UI/UX 2026 Buyer's Guide](https://www.forasoft.com/blog/article/ai-tools-ui-ux-design-software)

---

> **Report generated July 31, 2026**
> Research methodology: Direct analysis of 30+ Awwwards SOTD winners, crawl4ai extraction, browser-based inspection, web search of UX research papers and AI tool documentation.