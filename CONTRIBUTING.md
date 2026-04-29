# Contributing

1. Fork the repo and clone.
2. `npm install`
3. `npm run dev` — http://localhost:3000
4. `npm run build` — production build
5. `npm test` — eligibility unit tests
6. `npm run build:mobile` — static export for Capacitor
7. Open a PR against `main`. Keep commits small and conventional (`feat:`, `fix:`, `docs:`).

## Code style
- TypeScript strict mode.
- Tailwind for styling; no inline styles except positional orbs in `page.tsx`.
- All new pages go under `src/app/<route>/page.tsx`.
- All new API routes go under `src/app/api/<name>/route.ts` with `export const runtime = 'nodejs'`.
