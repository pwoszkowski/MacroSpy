-- migration: create profiles table
-- purpose: store static and anthropometric user data
-- relationship: 1:1 with auth.users
-- affected tables: profiles

-- create profiles table with 1:1 relationship to auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  height integer,
  gender text,
  birth_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- constraints
  constraint height_check check (height > 0)
);

comment on table public.profiles is 'User profile data including anthropometric measurements';
comment on column public.profiles.id is 'Primary key, references auth.users.id';
comment on column public.profiles.height is 'Height in centimeters';
comment on column public.profiles.gender is 'Gender (male/female) - required for BMR calculations';
comment on column public.profiles.birth_date is 'Date of birth for age calculation';

-- create trigger for automatic updated_at timestamp
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- note: rls disabled for development - will be enabled in production

