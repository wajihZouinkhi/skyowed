# Changelog

## 0.2.0 — 2026-04-23
### Fixed
- Removed conflicting root `app/`, `lib/`, `next.config.js`, `tailwind.config.js`, `postcss.config.js` — canonical source is `src/`.
- Gated `output: 'export'` behind `BUILD_TARGET=mobile` so API routes work in web builds.
- Deleted duplicate `src/lib/store.ts` (kept `store.tsx`).
- Fixed `tsconfig.json` path alias to `./src/*` and included only `src/**`.
- Added missing Capacitor dependencies to `package.json`.

### Added
- `/about`, `/faq`, `/success` pages.
- `src/app/api/letter/route.ts` — generates a personalised EU261/UK261 claim letter.
- `src/app/api/checkout/route.ts` — Stripe checkout for the €6.99 letter.
- `src/lib/letter.ts`, `src/lib/stripe.ts`, `src/lib/supabase.ts`.
- `src/lib/eligibility.test.ts` — 5 unit tests for the eligibility engine.
- `CHANGELOG.md`, `CONTRIBUTING.md`.

## 0.1.0 — 2026-04-23
- Initial scaffold: plan/ docs, Next.js skeleton, Supabase schema.
