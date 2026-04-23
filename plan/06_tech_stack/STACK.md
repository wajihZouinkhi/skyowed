# Tech Stack — Solo-founder optimized

## Web App (Phase 1 — months 1–3)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Easy deploy, fast, great SEO |
| Language | TypeScript | Fewer bugs |
| Styling | **Tailwind CSS** + **shadcn/ui** | Fast, looks professional |
| Hosting | **Vercel** (free tier) | Zero config |
| Database & Auth | **Supabase** (free tier) | Postgres + Auth + Storage in one |
| Payments | **Stripe** (2.9% + 30¢) | Global, easy |
| PDF generation | **@react-pdf/renderer** | Renders letters in-browser, no server needed |
| Flight data API | **AviationStack** (free 500 calls/mo, $50/mo for 10k) | Simple, cheap |
| Email sending | **Resend** (3,000 free/mo) | For confirmations, drip campaign |
| Analytics | **Plausible** or **PostHog** free | GDPR-compliant |
| Error tracking | **Sentry** (free tier) | See bugs immediately |

## Mobile App (Phase 2 — months 4–6)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Flutter** (or React Native) | One codebase → iOS + Android |
| In-app purchases | **RevenueCat** (free <$10k revenue) | Handles Apple + Google IAP in one SDK |
| Push notifications | **Firebase Cloud Messaging** (free) | Industry standard |
| Distribution | Apple Developer ($99/yr) + Google Play ($25 once) | Required |

## Why this stack is right for you
- ✅ All have generous free tiers
- ✅ No DevOps — zero servers to manage
- ✅ Solo-founder community & docs are huge
- ✅ If you can't code, a no-code version works: **Bubble.io + Make.com** for the MVP

## Cost at 0 users
**$0/month.**

## Cost at 10,000 monthly users
| Service | Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| AviationStack | $50 |
| Resend | $20 |
| Stripe fees | ~3% of revenue |
| **Total fixed** | **~$115/month** |
