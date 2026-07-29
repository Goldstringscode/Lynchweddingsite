# 🍽️ Wedding Menu Builder — Comprehensive Design Document

**Project:** Lynch Wedding Site (Next.js + Tailwind + shadcn/ui + Supabase)  
**Date:** July 29, 2026  
**Status:** Research & Design Phase  
**Target:** Standalone SaaS product for wedding venues

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Competitive Landscape Analysis](#2-competitive-landscape-analysis)
3. [Target User Personas](#3-target-user-personas)
4. [UX Design Principles](#4-ux-design-principles)
5. [Feature Architecture](#5-feature-architecture)
6. [Visual Design & Layouts](#6-visual-design--layouts)
7. [Data Model](#7-data-model)
8. [Implementation Phases](#8-implementation-phases)
9. [Sellable Product Strategy](#9-sellable-product-strategy)
10. [Quick Reference](#10-quick-reference)

---

## 1. Executive Summary

### The Problem
Wedding venues cobble together menu planning using spreadsheets, PDFs from caterers, and clunky enterprise software for corporate events (Caterease, Social Tables). Couples want to browse, compare, and select their wedding menu on phones. Venues want a tool that:
- Impresses clients during the sales process
- Reduces back-and-forth email chains over menu changes
- Handles dietary restrictions, budget tracking, and beautiful export
- Integrates with their existing booking workflow

### The Opportunity
A modern, visually stunning menu builder built for **wedding couples** (not banquet managers) that venues can **white-label** and present to clients. No existing product nails this intersection of beauty, UX, and venue-facing practicality.

### Core Differentiators
| Factor | Existing Tools | Our Product |
|--------|---------------|-------------|
| **Mobile-first** | Desktop/tablet only | Built mobile-first for browsing couples |
| **Visual design** | Utility-focused, dated UI | Restaurant-level visual design |
| **Couple experience** | Venue employee operates it | Couple can explore on their own |
| **Budget tracking** | Basic per-item costs | Real-time per-person + total + what-if scenarios |
| **Menu comparison** | Side-by-side not standard | Side-by-side entrée comparison built in |
| **Export quality** | Functional PDFs | Print-ready menu cards, digital previews |
| **Pricing model** | Per-seat enterprise licensing | Affordable per-event or per-venue subscription |

---

## 2. Competitive Landscape Analysis

### 2.1 Toast Tab / Tripleseat
**Overview:** Leading catering sales & event management platform (acquired by Toast).
**Strengths:** Deep CRM integration, menu package auto-pricing, comprehensive reporting, 15+ years established.
**Weaknesses:** Dated UI, built for corporate catering first, no couple-facing portal, expensive ($200-500+/mo), no visual menu builder.
**Our Advantage:** Couple's experience first, not venue's back office.

### 2.2 Gather (Gatherhere.com)
**Overview:** Modern catering platform for restaurants expanding into catering.
**Strengths:** Clean UI, good order management, delivery logistics.
**Weaknesses:** Not wedding-specific, no couple portal, no visual menu cards, no per-event budget tracking.
**Our Advantage:** Wedding-specific features (meal choice tracking, dietary per guest, comparison mode).

### 2.3 Social Tables (Cvent)
**Overview:** Event diagramming and seating platform (Cvent-owned).
**Strengths:** 3D floor plans, drag-and-drop seating, large corporate events.
**Weaknesses:** Menu is an afterthought, extremely expensive ($5,000+/yr), complex learning curve, no mobile guest experience.
**Our Advantage:** Focused menu builder, not a bloated suite.

### 2.4 Caterease
**Overview:** Most feature-complete catering software (decades old).
**Strengths:** Deep feature set (recipes, packing lists, equipment, staff shifts), dynamic menu building, customizable prints, Horizon Hub mobile.
**Weaknesses:** Windows desktop with web bolt-on, overwhelming complexity, no modern UX, no couple self-service.
**Our Advantage:** Modern web app, clean UX, mobile-first, couple self-service portal.

### 2.5 Other Notes
- **The Knot / WeddingWire / Zola:** Basic meal choice drop-downs, zero menu builder for venues.
- **Canva / Adobe Express:** Menu card design disconnected from data. No pricing, dietary tracking, or real-time updates.
- **Google Docs / Sheets:** Most common "solution" — fragile, error-prone, ugly exports.

---

## 3. Target User Personas

### 3.1 The Couple (Primary User)
- **Ages:** 25-38
- **Tech comfort:** High (daily app users)
- **Device:** Mobile-first (iPhone/Android)
- **Goals:** Browse menus visually, compare options, pick perfect meal, stay within budget
- **Pain points:** Spreadsheets confusing, caterer PDFs hard to compare, dietary restrictions get lost
- **Desires:** "This feels like picking a restaurant menu, not doing accounting"

### 3.2 The Venue Coordinator (Secondary User)
- **Role:** Sales or event manager at a wedding venue
- **Tech comfort:** Medium (uses CRM, email, calendar)
- **Device:** Laptop/desktop during work hours
- **Goals:** Show off menu to clients, close deals faster, reduce admin time
- **Pain points:** Endless email chains for menu changes, manually calculating budgets, ugly exports
- **Desires:** "A tool that impresses clients and saves me 5 hours per wedding"

### 3.3 The Caterer / Chef (Tertiary User)
- **Role:** Head chef or catering manager
- **Tech comfort:** Low-Medium
- **Device:** Tablet or phone in the kitchen
- **Goals:** See what was ordered, get dietary info, print production sheets
- **Pain points:** Handwritten notes, last-minute changes, unclear dietary flags
- **Desires:** "A clear readout of what to cook and who has restrictions"

---

## 4. UX Design Principles

### 4.1 Core Principles
1. **Mobile-first, always.** 70%+ of couples browse menus on phone during decision process. Every screen must work at 375px width.
2. **Visual over text.** Picture of dish > hundred words. Every item should have optional photo. Course build-up should be visual.
3. **Progressive disclosure.** Start broad (how many courses? what protein?), then drill specifics. Don't show all 120 items at once.
4. **Real-time feedback.** Every selection updates budget counter, meal visualization, guest count instantly. No save buttons for choices.
5. **Compare, don't deliberate.** Side-by-side comparison of 2-3 entrées is the killer feature.
6. **Undo-friendly.** Every action reversible with single tap/click. No confirmation dialogs for non-destructive actions.
7. **Offline resilience.** Menu browsing, budget, and selections work offline with sync when online.

### 4.2 Accessibility
- WCAG 2.1 AA compliance
- Color-coded items also have text labels
- Keyboard navigable menu builder
- Screen-reader-friendly dish descriptions
- High contrast mode

### 4.3 Performance Targets
- Initial menu load: < 1.5s (streaming + static generation)
- Item search/browse: < 200ms (local FTS or indexed DB)
- Budget recalculation: < 50ms (client-side, no network)
- PDF export: < 3s (server-side generation)
- Page transitions: instant (prefetch adjacent pages)

---

## 5. Feature Architecture

### 5.1 Feature Priority Matrix

| Priority | Feature | Effort | Impact | Notes |
|----------|---------|--------|--------|-------|
| **P0** | Visual menu browsing (grid/catalog) | Medium | Critical | Core browsing experience |
| **P0** | Budget tracker (real-time) | Low | Critical | Calculated constantly |
| **P0** | Menu builder canvas (meal assembly) | High | Critical | The main interaction |
| **P0** | Save/load menu drafts | Medium | Critical | Multiple menu versions |
| **P0** | Print-ready menu card export | Medium | Critical | Deliverable for couples |
| **P1** | Side-by-side comparison | Medium | High | Key differentiator |
| **P1** | Portion/size selectors | Low | High | Small vs large servings |
| **P1** | Allergen flags | Low | High | Safety requirement |
| **P1** | Category filtering & search | Medium | High | 120+ items needs robust filtering |
| **P1** | Drag-and-drop menu reordering | Medium | High | Intuitive course ordering |
| **P1** | Nutrition display | Medium | Medium | Growing demand |
| **P2** | Suggested pairings (auto-suggest) | Medium | Medium | Smart recommendations |
| **P2** | Toggle suggestions on/off | Low | Medium | User control preference |
| **P2** | Seasonal tags | Low | Medium | Helps decision-making |
| **P2** | Chef difficulty labels | Low | Low | Kitchen operations info |
| **P2** | Custom notes per item | Low | Medium | For chef/coordinator |
| **P2** | Future pricing projections | Medium | Low | Venue analytics |
| **P2** | Compare mode (multi-menu) | High | Medium | Advanced scenario planning |
| **P2** | RSVP integration (meal tracking) | High | Medium | Post-selection tracking |

### 5.2 Screen Specifications

#### Screen 1: Menu Browser (Grid View)
Grid of item cards (2 cols mobile, 3-4 desktop). Each card: photo (optional), name, price, tags (allergen, seasonal, difficulty). "Add" button adds to current course. "Pair" indicator shows complementary sides. Hover/tap reveals full description and nutrition. Category filter is horizontal scrollable chips. Full-text search across name, description, category. Budget bar at top updates in real time.

#### Screen 2: Menu Builder Canvas (Meal Builder)
Courses stacked vertically, each a collapsible card. Each shows selected item with portion control, nutrition, allergens. "Add Course" appends empty slot. Drag handle reorders courses. "Swap" opens browser modal filtered to same course type. "Suggested Sides" appears under mains when protein selected. Budget bar persistent (sticky) with per-person and total. Toggle suggestions on/off.

#### Screen 3: Side-by-Side Comparison
Full-screen modal overlay. Select 2-4 items to compare. Columns show: photo, price, description, rating, difficulty, nutrition, allergens, season. "Select This" replaces current selection. Best value / most popular badges. Scrollable horizontally for 3+. Mobile: stacks vertically with sticky header.

#### Screen 4: Menu Preview & Export
WYSIWYG preview of printed menu card. Two modes: **Couple-facing** (beautiful menu card) and **Kitchen-facing** (production sheet with counts, allergens). Export: PNG (high-res), PDF (print-optimized CSS), BEO (Banquet Event Order), Share Link (auth-protected).

### 5.3 Key Interaction Patterns
- **Add Item:** Tap "+" on card or drag to course slot. Budget animates. Suggestions appear for proteins. Portion adjustable immediately.
- **Swap Item:** Tap "Swap" on existing item. Modal opens filtered to same course type. Replacement updates budget and suggestions.
- **Compare Items:** Checkbox 2+ items -> "Compare (N)" button. Modal shows side-by-side. Select one to add to builder.
- **Budget:** Per-person cost, total cost, progress bar. Green/yellow/red. Tap for breakdown. "What if" mode adjusts guest count.

---

## 6. Visual Design & Layouts

### 6.1 Color System
```
Background:    warm off-white (#FDFBF7)
Surface:       white (#FFFFFF)
Accent:        #1a2e1a (dark forest green)
Gold:          #C9A84C (warm gold)
Text:          #1A1A1A (near-black)
Muted:         #6B7280
Success:       #16A34A  |  Warning: #F59E0B  |  Danger: #EF4444  |  Info: #3B82F6
```

### 6.2 Typography
- **Headings:** Playfair Display (serif, wedding elegance)
- **Body:** Inter or system sans-serif
- **Prices:** Tabular figures (monospaced)
- **Menu items:** 15-16px medium weight | **Descriptions:** 13-14px regular weight

### 6.3 Layout
- **Desktop (>=1024px):** Left sidebar = item browser (search, filters, paginated grid). Right = builder canvas (stacked course cards). Bottom = sticky budget bar.
- **Mobile (<768px):** Full-width canvas. "Browse All Items" navigates to full-screen browser modal. Budget bar sticky at bottom.

### 6.4 Component Inventory (new)
| Component | Description | Priority |
|-----------|-------------|----------|
| `MenuItemCard` | Grid card for menu browsing | P0 |
| `MenuBuilderCanvas` | Main course-by-course builder | P0 |
| `CourseSlot` | Single course (collapsible, draggable) | P0 |
| `PortionSelector` | Small/Medium/Large toggle | P0 |
| `BudgetBar` | Sticky bottom bar (per-person + total) | P0 |
| `BudgetBreakdown` | Expanded cost per course/item | P1 |
| `ComparisonModal` | Side-by-side comparison overlay | P1 |
| `AllergenBadge` | Common allergen indicators | P1 |
| `SeasonTag` | Season availability chip | P2 |
| `DifficultyBadge` | Chef prep difficulty indicator | P2 |
| `NutritionPanel` | Calories/macros display | P1 |
| `PairingSuggestion` | Suggested side/dessert card | P2 |
| `MenuDraftSelector` | Save/load/delete drafts | P0 |
| `MenuExportDialog` | PDF/PNG/BEO export options | P0 |

---

## 7. Data Model

### 7.1 Extend Existing menu_items Table
```sql
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS nutrition JSONB;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[];
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS season_tags TEXT[];
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pairing_group TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS suggested_sides UUID[];
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS suggested_desserts UUID[];
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ratings_cache JSONB;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_signature BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_small_portion BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_large_portion BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS small_price_modifier DECIMAL(10,2) DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS large_price_modifier DECIMAL(10,2) DEFAULT 0;
```

### 7.2 New menu_drafts Table
```sql
CREATE TABLE menu_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  guest_count INTEGER DEFAULT 150,
  target_budget_per_person DECIMAL(10,2),
  courses JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_locked BOOLEAN DEFAULT false
);
```

### 7.3 Local Storage
Menu drafts cached in IndexedDB for offline access + instant load. Sync with Supabase when online.

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- Extend menu_items schema with new columns
- Create menu_drafts table and API routes (CRUD)
- Build MenuItemCard with photo, price, tags
- Build grid browse with category filters and search
- Build CourseSlot with portion selector and swap
- Build menu builder canvas (stack courses, add/remove/reorder)
- Build BudgetBar with real-time per-person and total
- Add 30-50 realistic seed menu items
- Wire up save/load drafts

### Phase 2: Polish (Week 2)
- Build ComparisonModal (side-by-side)
- Build suggested pairings engine
- Add suggestions toggle on/off
- Add allergen flags and season tags
- Add nutrition panel
- Add chef difficulty labels
- Drag-and-drop course reordering (via @dnd-kit)
- Budget "what-if" mode (adjustable guest count)

### Phase 3: Export & Integration (Week 3)
- Beautiful menu card preview with wedding styling
- PNG export (html-to-image already installed)
- PDF export (print CSS + optional @react-pdf/renderer)
- BEO (Banquet Event Order) export
- Kitchen production sheet with counts + allergens
- Shareable auth-protected link
- RSVP meal tracking integration
- Dietary restrictions rollup for kitchen

### Phase 4: Standalone Product (Week 4)
- Venue registration/onboarding flow
- Multi-tenant support
- White-label config (name, logo, colors, fonts)
- Venue admin panel for menu management
- Pricing tiers (free trial, per-event, monthly)
- Stripe billing integration
- Documentation and API
- Demo mode with sample data
- Deploy to separate domain

---

## 9. Sellable Product Strategy

### 9.1 Target Market
- **Primary:** Wedding venues (banquet halls, hotels, estates, barn venues, country clubs)
- **Secondary:** Catering companies serving weddings
- **Tertiary:** Event planners designing menus for clients

### 9.2 Pricing Model

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | $0 | 1 draft, 10 items, basic export | Trial |
| **Starter** | $29/mo | 5 drafts, full catalog, PDF, budget | Small venues |
| **Pro** | $79/mo | Unlimited, comparison, pairings, white-label | Mid-size |
| **Enterprise** | $199/mo | Multi-venue, custom integrations, API | Chains |
| **Per-Event** | $49/event | Single wedding, full features, 30-day | Ad-hoc |

### 9.3 Key Selling Points
**"Wow" Factor:**
1. Couple Self-Service Portal — "Send couples a link. They browse, compare, build on their phone."
2. Beautiful Menu Cards — "Print-ready, Instagram-worthy. Free marketing for your venue."
3. Real-Time Budget — "Exact per-person and total costs. No surprises."
4. Dietary Management — "Allergens and restrictions tracked. Clean kitchen sheets."

**Operational Savings:**
5. "Save 3-5 hours per wedding on menu admin."
6. "No transcription errors from handwritten notes."
7. "Couples who browse on phone book 40% faster (projected)."

### 9.4 White-Label Strategy
- Venue uploads logo, sets brand colors + fonts
- Everything renders in venue's brand
- Custom subdomain: menu.venuename.com
- No "Powered by" branding on paid tiers
- Venue invites couples via email for branded login

### 9.5 Competitive Positioning

| Need | Toast | Gather | SocTables | Caterease | **Ours** |
|------|-------|--------|-----------|-----------|---------|
| Beautiful mobile UI | No | Partial | No | No | **Yes** |
| Couple self-service | No | No | No | No | **Yes** |
| Real-time budget | No | Partial | No | Partial | **Yes** |
| Menu comparison | No | No | No | No | **Yes** |
| Drag-and-drop builder | No | No | No | No | **Yes** |
| Beautiful menu PDFs | No | No | No | Partial | **Yes** |
| Allergen management | Partial | Partial | No | Yes | **Yes** |
| Kitchen production | Yes | Yes | No | Yes | **Yes** |
| White-label | No | No | No | No | **Yes** |
| Affordable pricing | No | Partial | No | Partial | **Yes** |

### 9.6 Go-To-Market
1. Beta partners: 5 venues free lifetime for feedback
2. Direct sales: Email venue managers, offer demo
3. Wedding industry events (National Wedding Show, Catersource)
4. Integrations with The Knot, WeddingWire, Zola
5. SEO content: "How to Design a Wedding Menu"

---

## 10. Quick Reference

### Feature to File Mapping

| Feature | File (proposed) | Priority |
|---------|----------------|----------|
| Menu Item Grid | `components/menu-builder/menu-item-card.tsx` | P0 |
| Menu Browser | `components/menu-builder/menu-browser.tsx` | P0 |
| Builder Canvas | `components/menu-builder/builder-canvas.tsx` | P0 |
| Course Slot | `components/menu-builder/course-slot.tsx` | P0 |
| Portion Selector | `components/menu-builder/portion-selector.tsx` | P0 |
| Budget Bar | `components/menu-builder/budget-bar.tsx` | P0 |
| Budget Breakdown | `components/menu-builder/budget-breakdown.tsx` | P1 |
| Comparison Modal | `components/menu-builder/comparison-modal.tsx` | P1 |
| Allergen Badge | `components/menu-builder/allergen-badge.tsx` | P1 |
| Season Tag | `components/menu-builder/season-tag.tsx` | P2 |
| Difficulty Badge | `components/menu-builder/difficulty-badge.tsx` | P2 |
| Nutrition Panel | `components/menu-builder/nutrition-panel.tsx` | P1 |
| Pairing Suggestions | `components/menu-builder/pairing-suggestions.tsx` | P2 |
| Menu Draft Selector | `components/menu-builder/menu-draft-selector.tsx` | P0 |
| Menu Preview | `components/menu-builder/menu-preview.tsx` | P0 |
| Menu Export Dialog | `components/menu-builder/menu-export.tsx` | P0 |
| Kitchen Sheet | `components/menu-builder/kitchen-sheet.tsx` | P1 |
| Venue Menu Manager | `components/menu-builder/venue-menu-manager.tsx` | P4 |
| White-Label Settings | `components/menu-builder/white-label-settings.tsx` | P4 |
| API: Menu Items | `app/api/menu/route.ts` (extend) | P0 |
| API: Menu Drafts | `app/api/menu/drafts/route.ts` (new) | P0 |
| API: Menu Export | `app/api/menu/export/route.ts` (new) | P1 |

### Existing Project Context

The current project at `C:\Users\Justin\sites\lynchweddingsite\` has:
- `/app/admin/page.tsx` renders `AdminDashboard` component
- Sidebar navigation with 8 pages including "Menu & Catering"
- `CateringDashboard` with 3 sub-tabs via shadcn/ui Tabs: Analytics, Edit Menu, Preview & Export
- Current `EditMenuTab` is basic CRUD list with categories and sort arrows
- Current `PreviewExportTab` renders styled card with PNG/PDF export
- `menu_items` table: id, category, name, description, price, sort_order, is_available, created_at
- Menu API at `/app/api/menu/route.ts` handles GET, POST, PUT, DELETE
- Uses Supabase with `supabaseAdmin` client

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| July 29, 2026 | Hermes Agent | Initial comprehensive design document |
