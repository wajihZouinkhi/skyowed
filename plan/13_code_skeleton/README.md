# Code Skeleton — Next.js Starter

This folder has a minimal working Next.js 14 skeleton you (or your freelancer) can expand.

## Files included
- `package.json`
- `app/page.tsx` — home page with flight form
- `app/api/check/route.ts` — eligibility API endpoint
- `lib/eligibility.ts` — pure eligibility engine (the BRAIN)
- `lib/rules.ts` — regulation data
- `lib/airports.ts` — tiny airport sample (replace with full dataset)
- `lib/haversine.ts` — distance calc
- `components/FlightForm.tsx`
- `components/ResultCard.tsx`

## Quick start
```bash
npm create next-app@latest flightclaim -- --typescript --tailwind --app
cd flightclaim
cp -r /workspace/flightclaim_kit/13_code_skeleton/src/* ./
npm run dev
```

Then set env vars in `.env.local`:
```
AVIATIONSTACK_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
STRIPE_SECRET_KEY=xxx
```
