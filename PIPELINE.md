# 🏗️ Lynch Wedding Site — Pipeline Context

> Created: 2026-07-29
> Any agent can pick up this file and start working cold.

## Project Overview

| Field | Value |
|-------|-------|
| **Repo** | `C:\Users\Justin\sites\lynchweddingsite` |
| **Stack** | Next.js 14.2.35, React 18.3.1, Tailwind v4, shadcn/ui |
| **Database** | Supabase (Postgres) |
| **Deployed URL** | https://lynchweddingsite.vercel.app |
| **Dev port** | 3000 |
| **Wedding date** | September 14, 2026 — Nikkita & Justin |
| **Admin password** | `JNLynch26` |

## Supabase

| Field | Value |
|-------|-------|
| **Project URL** | `https://asnkchxmqanvdljzgshv.supabase.co` |
| **Anon key** | `sb_publishable_5Mw0mpu6p4klt5FDZSnCqg_tKny0Uhy` |
| **Service role key** | `sb_secret_tM5ALPnz-OOn2ukcRQaWIQ_cH80GyHm` |
| **Schema** | `supabase-schema.sql` — full DDL + seed data |
| **Tables** | `guests`, `vendors`, `invoices`, `vendor_deadlines`, `wedding_settings`, `wedding_checklist` |

## Vercel Deploy

| Field | Value |
|-------|-------|
| **CLI token path** | `~/.vercel/auth.json` (JSON with `{"token": "..."}`) |
| **CLI command** | `vercel --prod --yes --token "$(cat ~/.vercel/auth.json | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")"` |
| **Git remote** | Connected via Vercel GitHub integration — `git push` auto-deploys to `main` |

## Admin Dashboard Pages

| Key | Component | Description |
|-----|-----------|-------------|
| `dashboard` | `DashboardPage` | Stats overview (guests, vendors, invoices) |
| `rsvps` | `RsvpsPage` | RSVP & guest list management |
| `menu` | `CateringDashboard` | Menu & catering tracking |
| `vendors` | `VendorsPage` | Vendor management |
| `invoices` | `InvoicesPage` | Invoice tracking |
| `checklist` | `ChecklistPage` | **NEW** — 130-task wedding checklist across 14 categories |
| `emails` | `EmailsPage` | Email template builder |
| `settings` | `SettingsPage` | Wedding settings |

## Key Files

| File | Purpose |
|------|---------|
| `supabase-schema.sql` | Full database schema + seed data |
| `lib/supabase-admin.ts` | Server-side Supabase client (bypasses RLS) |
| `lib/supabase.ts` | Client-side Supabase client |
| `lib/data.ts` | Shared types (Guest, Vendor, Invoice, etc.) |
| `lib/sanitize.ts` | Mass assignment field whitelist |
| `lib/utils.ts` | Utility functions (cn, etc.) |
| `middleware.ts` | Admin auth protection (cookie-based) |
| `app/api/` | All API routes (rsvp, vendors, invoices, stats, checklist, admin/login/logout) |

## Known Issues

- **Gray screen flash** — FIXED (2026-07-29): critical inline CSS + `themeColor` + loading states
- **"Add to Wallet"** — Not working (pending PassKit signup, needs business domain)
- **SMS feature** — Pending Twilio setup

## Hermes Skills Used With This Project

- `inkling-cost-decision` — cost math for model switching
- `nexus-safety-monitor` — runtime safety middleware
- `code-act` — multi-tool Python batching

## Environment (.env.local)

Stored at `C:\Users\Justin\sites\lynchweddingsite\.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Development Commands

```bash
cd /c/Users/Justin/sites/lynchweddingsite
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # Lint check
```

## Recent Changes (2026-07-29)

1. ✅ **Wedding Checklist** — Admin tab with 130 tasks, Supabase-backed, toggle-able
2. ✅ **Gray screen flash fix** — Critical inline CSS + themeColor + admin layout wrapper + loading states
3. ✅ **NEXUS Safety Monitor** — System-wide runtime safety (arXiv 2607.19356)
4. ✅ **Mass assignment fix** — Field whitelist for PATCH/POST endpoints