# SkyOwed — Execution TODO

> **Audience:** A junior AI/dev executing tasks one at a time.
>
> **Rules:**
> 1. Do ONE task at a time, top to bottom. Do not skip.
> 2. After each task, run the Verify step. If it fails, STOP and report.
> 3. Never invent APIs, env vars, or file paths not listed here.
> 4. Keep existing style: Next.js 14 App Router, TypeScript, Tailwind, path alias `@/*` -> `src/*`.
> 5. Add deps via `npm install <pkg>` — do not hand-edit `package.json` versions.
> 6. Tests: `src/lib/*.test.ts`, run via `npm test`.
> 7. If a file exists, READ it first before editing.

## Project facts

- Next.js 14.2.5, React 18.3.1, TS 5.4.5, Tailwind 3.4.4
- Path alias `@/*` -> `./src/*` (see `tsconfig.json`)
- Source root is `src/` only
- `output: 'export'` gated by `BUILD_TARGET=mobile` in `next.config.mjs`
- API routes use `export const runtime = 'nodejs'`

## Phases overview

- PHASE 1 — Foundation (env, supabase, auth)
- PHASE 2 — Revenue (Stripe checkout + webhook + PDF paywall)
- PHASE 3 — Persistence (save claims, dashboard wiring)
- PHASE 4 — Polish (disclaimer, rate limit, analytics)
- PHASE 5 — Flight lookup + Pro features (AviationStack, Gmail scan)
- PHASE 6 — Launch readiness (tests, CI, backups, SEO)

Details for each task are in the sections below.

---

# PHASE 1 — FOUNDATION

## Task 1.1 — Complete `.env.example`

Replace entire file `.env.example` with:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_PRO=

# Flight data (optional)
AVIATIONSTACK_API_KEY=

# E2B (optional, Gmail scan)
E2B_API_KEY=

# Observability (optional)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

**Verify:** All keys present. No real secrets committed.

## Task 1.2 — Complete Supabase schema

Replace entire file `supabase/schema.sql` with the SQL block below. Then paste it into the Supabase SQL editor.

```sql
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  pro boolean default false,
  pro_since timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  flight_number text,
  depart text not null,
  arrive text not null,
  flight_date date,
  delay_hours numeric,
  reason text check (reason in ('delay','cancellation','denied_boarding')),
  extraordinary boolean default false,
  eligible boolean,
  amount_eur integer,
  amount_gbp integer,
  regulation text,
  status text default 'draft' check (status in ('draft','letter_sent','airline_responded','paid','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table claims enable row level security;

drop policy if exists "profiles self read" on profiles;
create policy "profiles self read" on profiles for select using (auth.uid() = id);

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update using (auth.uid() = id);

drop policy if exists "claims self read" on claims;
create policy "claims self read" on claims for select using (auth.uid() = user_id);

drop policy if exists "claims self insert" on claims;
create policy "claims self insert" on claims for insert with check (auth.uid() = user_id);

drop policy if exists "claims self update" on claims;
create policy "claims self update" on claims for update using (auth.uid() = user_id);

drop policy if exists "claims self delete" on claims;
create policy "claims self delete" on claims for delete using (auth.uid() = user_id);
```

**Verify:** SQL executes with no errors in Supabase.

## Task 1.3 — Install Supabase SDK

Run: `npm install @supabase/supabase-js @supabase/ssr`

**Verify:** Both packages appear in `package.json` dependencies.

## Task 1.4 — Create Supabase clients

Create `src/lib/supabase/client.ts`:

```ts
'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => store.get(n)?.value,
        set: (n, v, o: CookieOptions) => { try { store.set({ name: n, value: v, ...o }); } catch {} },
        remove: (n, o: CookieOptions) => { try { store.set({ name: n, value: '', ...o }); } catch {} },
      },
    }
  );
}

export function createServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

**Verify:** `npm run build` compiles without TS errors.

## Task 1.5 — Auth middleware

Create `src/middleware.ts` that refreshes the Supabase session on every request. Use `createServerClient` from `@supabase/ssr` with cookie getters/setters reading from `request.cookies` and writing to the response. Exclude `_next/static`, `_next/image`, `favicon.ico`, and `api/webhook` in the matcher.

Reference: https://supabase.com/docs/guides/auth/server-side/nextjs

**Verify:** Dev server starts, no cookie errors in console.

## Task 1.6 — Auth callback route

Create `src/app/auth/callback/route.ts` that:
- reads `?code=` query param
- calls `supabase.auth.exchangeCodeForSession(code)` using the server client from `@/lib/supabase/server`
- redirects to `/dashboard`

**Verify:** Visiting `/auth/callback?code=FAKE` returns a 4xx (expected — real code only comes from email).

## Task 1.7 — Login page

Create `src/app/login/page.tsx` (client component):
- email input
- on submit: `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`${location.origin}/auth/callback\` } })`
- show "Check your email" on success

Use the existing Tailwind utility classes `field`, `btn-primary`, `glass` (defined in `src/app/globals.css`).

**Verify:** Submitting an email shows success state; email arrives in Supabase Auth logs.

## Task 1.8 — Sign-out action

Create `src/app/auth/signout/route.ts` (POST):
- calls `supabase.auth.signOut()` via server client
- redirects to `/`

**Verify:** POST to `/auth/signout` while logged in clears session.

---

# PHASE 2 — REVENUE (Stripe)

## Task 2.1 — Install Stripe

Run: `npm install stripe`

**Verify:** `stripe` in `package.json` dependencies.

## Task 2.2 — Create Stripe server helper

Create `src/lib/stripe.ts`:

```ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});
```

**Verify:** Imports resolve, no TS errors.

## Task 2.3 — Stripe product + price (manual)

In Stripe Dashboard (test mode):
1. Create Product "SkyOwed Pro" — one-time €6.99.
2. Copy the **Price ID** into `.env.local` as `STRIPE_PRICE_ID_PRO`.
3. Copy publishable and secret keys into `.env.local`.

**Verify:** `.env.local` has all 4 Stripe vars filled.

## Task 2.4 — Checkout route

Create `src/app/api/checkout/route.ts`:

- `export const runtime = 'nodejs'`
- POST handler:
  - get user via `createClient()` from `@/lib/supabase/server`; if no user, return 401
  - create a Stripe Checkout Session with:
    - `mode: 'payment'`
    - `line_items: [{ price: process.env.STRIPE_PRICE_ID_PRO, quantity: 1 }]`
    - `success_url: \`${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}\``
    - `cancel_url: \`${process.env.NEXT_PUBLIC_APP_URL}/dashboard\``
    - `customer_email: user.email`
    - `metadata: { user_id: user.id }`
  - return `{ url: session.url }`

**Verify:** `curl -X POST http://localhost:3000/api/checkout` (with auth cookie) returns a Stripe URL.

## Task 2.5 — Webhook route (pro unlock)

Create `src/app/api/webhook/route.ts`:

- `export const runtime = 'nodejs'`
- Read raw body: `const body = await req.text();`
- Verify signature: `stripe.webhooks.constructEvent(body, req.headers.get('stripe-signature')!, process.env.STRIPE_WEBHOOK_SECRET!)`
- On `checkout.session.completed`:
  - extract `session.metadata.user_id`
  - use `createServiceClient()` from `@/lib/supabase/server`
  - `update('profiles').set({ pro: true, pro_since: new Date().toISOString(), stripe_customer_id: session.customer }).eq('id', user_id)`
- return `new Response('ok', { status: 200 })`

**IMPORTANT:** The middleware matcher must exclude `api/webhook` (done in Task 1.5).

**Verify:** Run `stripe listen --forward-to localhost:3000/api/webhook` and trigger `stripe trigger checkout.session.completed` → `profiles.pro` becomes true.

## Task 2.6 — Upgrade button in dashboard

In `src/app/dashboard/page.tsx`, add an "Upgrade to Pro — €6.99" button that:
- POSTs to `/api/checkout`
- on success, does `window.location.href = data.url`

Hide button if the user profile already has `pro = true`.

**Verify:** Clicking button sends user to Stripe Checkout.

## Task 2.7 — Gate PDF behind Pro

In `src/app/api/letter/pdf/route.ts`:
- get user via server Supabase client
- if not logged in OR `profiles.pro !== true`, return 402 `{ error: 'pro_required' }`
- otherwise generate and return the PDF as today

**Verify:** Free user → 402. Pro user → PDF download.

## Task 2.8 — Success page verification

In `src/app/success/page.tsx`:
- read `?session_id=` from searchParams
- server-side: `stripe.checkout.sessions.retrieve(session_id)` and confirm `payment_status === 'paid'`
- if yes, show "You are Pro. Thank you." + link to `/dashboard`

**Verify:** Completing a Stripe test checkout returns a success screen.

---

# PHASE 3 — PERSISTENCE

## Task 3.1 — Save claim after eligibility check

Modify `src/app/api/check/route.ts`:
- after computing `result`, get the current user via `createClient()` from `@/lib/supabase/server`
- if user exists, `insert` into `claims` with depart/arrive/delayHours/reason/extraordinary/eligible/amount_eur/amount_gbp/regulation
- return `{ ...result, claimId: inserted.id }` if saved, else just `result`
- NEVER fail the check if saving fails — log and continue

**Verify:** Logged-in user runs a check → row appears in `claims` table.

## Task 3.2 — Dashboard shows real claims

In `src/app/dashboard/page.tsx`:
- convert to a Server Component (remove `'use client'` from top of file unless interactivity requires it; split into server + client children)
- use `createClient()` from `@/lib/supabase/server` to fetch `select * from claims where user_id = auth.uid() order by created_at desc`
- render via the existing `ClaimsList` component (pass rows as props)
- if not logged in, redirect to `/login`

**Verify:** Dashboard lists the user's claim history.

## Task 3.3 — Update claim status

Add `POST /api/claims/[id]/status` route:
- body: `{ status: 'letter_sent' | 'airline_responded' | 'paid' | 'rejected' }`
- verify user owns the claim (RLS handles it; still check)
- update `status` and `updated_at`

Wire a status dropdown into `ClaimsList`.

**Verify:** Changing the dropdown persists across reloads.

---

# PHASE 4 — POLISH

## Task 4.1 — Disclaimer on result screen

In `src/components/ResultCard.tsx`, add a small footer block:

> "SkyOwed is not a law firm and does not hold your funds. This is an informational estimate based on EU261/UK261 regulations."

Style: small, muted, visible on every result.

**Verify:** Every eligibility result shows the disclaimer.

## Task 4.2 — Cookie banner (minimal)

Create `src/components/CookieBanner.tsx` (client):
- shows if `localStorage['skyowed-cookies'] !== 'accepted'`
- "Accept" button stores the flag
- 1-line text + Privacy link

Mount it in `src/app/layout.tsx`.

**Verify:** First visit shows banner; Accept dismisses permanently.

## Task 4.3 — Rate limit on API routes

Install `npm install @upstash/ratelimit @upstash/redis`.

Create `src/lib/ratelimit.ts`:
- export `limit(ip, key)` using Upstash sliding window (10 req / 10s per IP on `/api/check`, `/api/letter`, `/api/letter/pdf`, `/api/checkout`)

If Upstash env vars are missing, the helper becomes a no-op (do not break local dev).

Add to each API route at the top of the handler:
```ts
const ip = req.headers.get('x-forwarded-for') ?? 'local';
const ok = await limit(ip, 'check');
if (!ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
```

Add env vars to `.env.example`:
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Verify:** 11 rapid requests → 11th returns 429.

## Task 4.4 — Analytics (Plausible)

In `src/app/layout.tsx`, conditionally render the Plausible `<script>` tag if `process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set:

```tsx
{process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
  <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />
)}
```

Fire custom events from CheckForm on success: `plausible('flight_check', { props: { eligible: result.eligible } })`.

**Verify:** Events appear in Plausible dashboard.

## Task 4.5 — Sentry error tracking

Run `npx @sentry/wizard@latest -i nextjs` and follow the prompts.

If `NEXT_PUBLIC_SENTRY_DSN` is empty, the SDK must be effectively disabled (do not spam logs).

**Verify:** Throw a test error in an API route → visible in Sentry.

---

# PHASE 5 — FLIGHT LOOKUP + PRO FEATURES

## Task 5.1 — AviationStack flight lookup

Create `src/lib/flightLookup.ts`:
- `export async function lookupFlight(flightNumber: string, date: string)`
- calls `http://api.aviationstack.com/v1/flights?access_key=${KEY}&flight_iata=${flightNumber}&flight_date=${date}`
- returns `{ depart, arrive, scheduledDeparture, actualArrival, airline }`
- if `AVIATIONSTACK_API_KEY` empty, throw `new Error('lookup_disabled')`

Add route `POST /api/flight-lookup` that wraps it and applies rate limiting.

Add a "Look up flight" button on `CheckForm` that calls it and prefills depart/arrive/delayHours.

**Verify:** Entering a real past flight number + date prefills the form.

## Task 5.2 — Gmail scan (Pro)

Scope: Pro users connect Gmail, we scan the last 3 years for airline emails matching "delay/cancellation/compensation", extract candidate claims.

Steps (create as `plan/16_gmail_scan/SPEC.md` before coding):
1. Google OAuth2 app (readonly Gmail scope)
2. `/api/gmail/connect` initiates OAuth
3. `/api/gmail/callback` stores encrypted refresh token in `profiles.gmail_refresh_token`
4. Background worker (E2B sandbox or Vercel cron) pulls messages in batches
5. Parser extracts flight number + date + disruption type (regex per-airline)
6. Found candidates inserted into `claims` as `status = 'draft'`

Schema addition (new migration):
```sql
alter table profiles add column if not exists gmail_refresh_token_enc text;
```

This task is multi-day. Only attempt after Phases 1–4 are stable.

**Verify:** A test Gmail inbox yields at least one candidate claim row.

---

# PHASE 6 — LAUNCH READINESS

## Task 6.1 — Expand eligibility tests to 20 scenarios

In `src/lib/eligibility.test.ts`, add cases covering:
- short/medium/long-haul EU departures with 2/3/4 hr delays
- cancellation with/without 14-day notice
- denied boarding
- extraordinary circumstances exemption
- UK261 vs EU261 jurisdiction (GB depart, non-EU carrier; EU depart, GB carrier)
- non-EU to non-EU on an EU carrier (should be ineligible unless departing EU)
- edge: exactly 1500 km, exactly 3500 km
- edge: delay exactly 3 hours

**Verify:** `npm test` → all 20 cases pass.

## Task 6.2 — GitHub Actions CI

Create `.github/workflows/ci.yml`:
```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
```

**Verify:** PR to `main` triggers all 4 steps green.

## Task 6.3 — Supabase daily backup

Create `.github/workflows/backup.yml` (cron daily) that:
- runs `supabase db dump --db-url $SUPABASE_DB_URL > backup.sql`
- uploads as a workflow artifact with 30-day retention

Add repo secret `SUPABASE_DB_URL` (pooler connection string).

**Verify:** Workflow runs successfully once manually via "Run workflow".

## Task 6.4 — Per-airline SEO pages

For each of `ryanair`, `easyjet`, `lufthansa`:
- Create `src/app/airlines/[slug]/page.tsx` if not already dynamic
- Static content: "Claim compensation from {Airline}" + their claim email address (from `src/lib/airlines.ts`) + example amounts + CTA to `/#check`
- Export `generateStaticParams` returning the 3 slugs
- Export `generateMetadata` with airline-specific title and description

**Verify:** `/airlines/ryanair`, `/airlines/easyjet`, `/airlines/lufthansa` all render with unique meta tags.

## Task 6.5 — Update sitemap + robots

Ensure `src/app/sitemap.ts` includes: `/`, `/about`, `/faq`, `/privacy`, `/terms`, `/airlines`, `/airlines/<each-slug>`, `/login`.

**Verify:** `/sitemap.xml` lists all URLs.

## Task 6.6 — Final pre-launch checklist

Walk every item in `plan/15_checklists/PRE_LAUNCH.md` and tick it off. For any item that cannot be completed, write a one-line reason in `PROGRESS.md` at repo root.

**Verify:** All items either ticked or documented as deferred.

---

# Reference: file map the junior AI will touch

| Create | Modify |
|---|---|
| `src/lib/supabase/client.ts` | `.env.example` |
| `src/lib/supabase/server.ts` | `supabase/schema.sql` |
| `src/lib/stripe.ts` | `src/app/api/check/route.ts` |
| `src/lib/ratelimit.ts` | `src/app/api/letter/pdf/route.ts` |
| `src/lib/flightLookup.ts` | `src/app/dashboard/page.tsx` |
| `src/middleware.ts` | `src/app/success/page.tsx` |
| `src/app/login/page.tsx` | `src/components/ResultCard.tsx` |
| `src/app/auth/callback/route.ts` | `src/components/CheckForm.tsx` |
| `src/app/auth/signout/route.ts` | `src/app/layout.tsx` |
| `src/app/api/checkout/route.ts` | `src/app/sitemap.ts` |
| `src/app/api/webhook/route.ts` | `src/lib/eligibility.test.ts` |
| `src/app/api/claims/[id]/status/route.ts` | |
| `src/app/api/flight-lookup/route.ts` | |
| `src/components/CookieBanner.tsx` | |
| `.github/workflows/ci.yml` | |
| `.github/workflows/backup.yml` | |

# Stop conditions

Stop and ask the human if:
- Any `npm install` fails
- A Supabase migration reports an error
- Types from `@supabase/ssr` or `stripe` cannot be resolved
- A file this TODO says to CREATE already exists with non-trivial content
- An env var needed to verify a task is empty


