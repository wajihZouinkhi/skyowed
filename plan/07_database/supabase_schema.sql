-- FlightClaim database schema (Supabase / PostgreSQL)

-- Users table is auto-created by Supabase Auth
-- We extend it with a profiles table

create table public.profiles (
    id uuid references auth.users primary key,
    full_name text,
    address text,
    phone text,
    iban text,
    bic text,
    default_language text default 'en',
    is_pro boolean default false,
    pro_until timestamptz,
    created_at timestamptz default now()
);

create table public.flights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    flight_number text not null,
    scheduled_date date not null,
    airline_iata text,
    airline_name text,
    origin_iata text,
    origin_country text,
    destination_iata text,
    destination_country text,
    distance_km int,
    actual_arrival timestamptz,
    scheduled_arrival timestamptz,
    scheduled_departure timestamptz,
    actual_departure timestamptz,
    raw_api_response jsonb,
    created_at timestamptz default now()
);

create table public.claims (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    flight_id uuid references public.flights,
    event_type text check (event_type in ('DELAYED','CANCELLED','DENIED_BOARDING','DIVERTED')),
    jurisdiction text check (jurisdiction in ('EU261','UK261','US_DOT','AU_ACL','MONTREAL','NONE')),
    rule_version text,
    calculated_amount numeric(10,2),
    currency text,
    eligibility_status text check (eligibility_status in ('ELIGIBLE','NOT_ELIGIBLE','UNCERTAIN')),
    eligibility_reason text,
    letter_generated_at timestamptz,
    letter_pdf_url text,
    letter_language text,
    claim_sent_at timestamptz,
    airline_reply text,
    outcome text check (outcome in ('PAID','REJECTED','PENDING','ESCALATED')),
    payout_amount numeric(10,2),
    user_notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.airlines (
    iata text primary key,
    name text not null,
    country text,
    claims_email text,
    claims_postal_address text,
    online_claim_url text,
    notes text
);

create table public.rule_versions (
    id serial primary key,
    jurisdiction text,
    version text,
    effective_from date,
    effective_to date,
    short_haul_threshold_hours numeric,
    long_haul_threshold_hours numeric,
    short_haul_amount numeric,
    mid_haul_amount numeric,
    long_haul_amount numeric,
    currency text,
    notes text
);

-- Seed the current EU261 rule
insert into rule_versions (jurisdiction, version, effective_from, short_haul_threshold_hours, long_haul_threshold_hours, short_haul_amount, mid_haul_amount, long_haul_amount, currency)
values ('EU261','v1-2004','2004-02-17', 3, 3, 250, 400, 600, 'EUR'),
       ('UK261','v1-post-brexit','2020-01-31', 3, 3, 220, 350, 520, 'GBP');

-- Row Level Security
alter table profiles enable row level security;
alter table flights  enable row level security;
alter table claims   enable row level security;

create policy "user reads own profile" on profiles for select using (auth.uid() = id);
create policy "user updates own profile" on profiles for update using (auth.uid() = id);
create policy "user reads own flights" on flights for select using (auth.uid() = user_id);
create policy "user inserts own flights" on flights for insert with check (auth.uid() = user_id);
create policy "user reads own claims" on claims for select using (auth.uid() = user_id);
create policy "user inserts own claims" on claims for insert with check (auth.uid() = user_id);
create policy "user updates own claims" on claims for update using (auth.uid() = user_id);
