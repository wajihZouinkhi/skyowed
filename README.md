# SkyOwed ✈️

> **Keep 100% of your flight compensation.** We're just a tool.

SkyOwed checks if your delayed, cancelled, or overbooked flight is eligible for compensation under **EU261 / UK261**, tells you the exact amount the airline owes you, and generates a ready-to-send claim letter in your language. Unlike AirHelp / Flightright, we take **0%** of your money.

## 📁 Repository layout

| Path | Purpose |
|---|---|
| `app/` | Next.js 14 App Router (TypeScript, Tailwind) |
| `lib/` | Pure eligibility engine (EU261 v1/v2, UK261) — framework-free, unit-testable |
| `supabase/` | Supabase schema (SQL) |
| `plan/` | Full build plan: strategy, legal rules, letter templates, design, GTM, checklists |

## 🚀 Quickstart

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## 🧠 Core flow

1. User enters flight number + date + delay hours.
2. `lib/eligibility.ts` applies the correct rule set (EU261 / UK261) based on route and airline country.
3. We display the estimated compensation.
4. **Free**: eligibility check. **Pro (€6.99)**: full PDF claim letter, history, Gmail scan.

## 🔐 Environment variables

See [`.env.example`](./.env.example):
- **Supabase** — auth + saved claims
- **Stripe** — Pro unlock payments
- **E2B** — secure sandboxes for PDF rendering and the Gmail "scan last 3 years" worker

## 📜 Legal posture

We are **not** a law firm, **not** a claims manager, and we **never** hold user funds. See `plan/11_legal_docs` for Privacy Policy, Terms, and Disclaimer templates.

## 🗺️ Roadmap

See [`plan/12_roadmap_and_costs/ROADMAP_12_WEEKS.md`](./plan/12_roadmap_and_costs/ROADMAP_12_WEEKS.md) for the 12-week solo launch plan.

---

Built from the `flightclaim_kit` blueprint — the full plan lives under [`plan/`](./plan).
