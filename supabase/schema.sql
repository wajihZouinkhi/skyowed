-- Run in Supabase SQL Editor

-- Users are handled by Supabase auth.
-- We extend with a profile table for pro status.

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