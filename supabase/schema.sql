-- Run in Supabase SQL Editor

-- Users are handled by Supabase auth.
-- We extend with a profile table for pro status.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  pro boolean default false,
  pro since timestamp,
  created_at timestamp default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(i