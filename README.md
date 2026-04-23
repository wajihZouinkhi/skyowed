# SkyOwed ✈️

EU261 / UK261 flight delay & cancellation compensation tool.
**Keep 100% of your claim. We're a tool, not a middleman.**

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (fully responsive: mobile → desktop)
- Pure-function eligibility engine (unit-testable)
- PDF claim letter generation (phase 2)

## Dev
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Test
```bash
npm test
```

## Project structure
```
src/
  app/
    page.tsx             # Landing + eligibility form
    api/check/route.ts   # POST /api/check
  components/
    CheckForm.tsx        # Responsive form (mobile-first)
    ResultCard.tsx       # Result display
  lib/
    rules.ts             # EU261/UK261 thresholds & amounts
    eligibility.ts       # Decision tree (pure functions)
    haversine.ts         # Great-circle distance
    airports.ts          # IATA → (country, lat, lon) seed
    eligibility.test.ts  # Unit tests
```

## Roadmap
- [x] Eligibility engine (EU261 + UK261, delay/cancellation/denied-boarding)
- [x] Responsive landing page
- [x] Unit tests
- [ ] PDF claim letter (EN/FR/DE/ES)
- [ ] Airport autocomplete (full OpenFlights DB)
- [ ] Supabase auth + save claim history
- [ ] Flight API integration (AviationStack) for auto-fill delay
- [ ] Stripe/Paddle one-time unlock (€9.99 per claim)
- [ ] Capacitor wrapper → Google Play Store

## Legal disclaimer
SkyOwed is not a law firm. Information only, not legal advice. Authoritative sources: Regulation (EC) 261/2004 and The Air Passenger Rights and Air Travel Organisers' Licensing (Amendment) (EU Exit) Regulations 2019 (UK).
