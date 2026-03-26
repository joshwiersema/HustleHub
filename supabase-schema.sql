-- ============================================================
-- HustleHub Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- This creates all tables with Row Level Security (RLS) enabled
-- so each user can only access their own data.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  business_name text not null default '',
  hustle_type text not null default 'lawn_care',
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CLIENTS
-- ============================================================
create table public.clients (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users can manage own clients"
  on public.clients for all using (auth.uid() = user_id);

-- ============================================================
-- JOBS
-- ============================================================
create table public.jobs (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id text not null default '',
  client_name text not null default '',
  title text not null,
  date text not null,
  time text not null default '',
  duration integer not null default 60,
  price numeric(10,2) not null default 0,
  status text not null default 'upcoming',
  recurring boolean not null default false,
  recurring_frequency text,
  notes text not null default '',
  address text not null default '',
  photo_uri text,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Users can manage own jobs"
  on public.jobs for all using (auth.uid() = user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table public.payments (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_id text,
  client_name text not null default '',
  amount numeric(10,2) not null default 0,
  method text not null default 'cash',
  date text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can manage own payments"
  on public.payments for all using (auth.uid() = user_id);

-- ============================================================
-- GAME STATE
-- ============================================================
create table public.game_state (
  id uuid references auth.users on delete cascade primary key,
  xp integer not null default 0,
  level integer not null default 1,
  hustle_bucks integer not null default 50,
  streak integer not null default 0,
  last_activity_date text,
  earned_badges text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.game_state enable row level security;

create policy "Users can view own game state"
  on public.game_state for select using (auth.uid() = id);

create policy "Users can insert own game state"
  on public.game_state for insert with check (auth.uid() = id);

create policy "Users can update own game state"
  on public.game_state for update using (auth.uid() = id);

-- Auto-create game state on signup
create or replace function public.handle_new_user_game()
returns trigger as $$
begin
  insert into public.game_state (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_game
  after insert on auth.users
  for each row execute function public.handle_new_user_game();

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_clients_user on public.clients(user_id);
create index idx_jobs_user on public.jobs(user_id);
create index idx_jobs_status on public.jobs(user_id, status);
create index idx_payments_user on public.payments(user_id);
