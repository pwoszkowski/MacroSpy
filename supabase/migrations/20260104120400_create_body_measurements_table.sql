-- migration: create body measurements table
-- purpose: track progress in weight and body composition (US-010)
-- relationship: 1:N with users (one user has many measurements over time)
-- affected tables: body_measurements

-- create body measurements table for tracking physical progress
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight numeric(5, 2) not null,
  body_fat_percentage numeric(4, 1),
  muscle_percentage numeric(4, 1),
  created_at timestamptz not null default now(),
  
  -- constraints
  constraint weight_check check (weight > 0),
  constraint body_fat_percentage_check check (
    body_fat_percentage is null or 
    (body_fat_percentage >= 0 and body_fat_percentage <= 100)
  ),
  constraint muscle_percentage_check check (
    muscle_percentage is null or 
    (muscle_percentage >= 0 and muscle_percentage <= 100)
  )
);

comment on table public.body_measurements is 'Body measurements for tracking weight and composition progress';
comment on column public.body_measurements.date is 'Date of measurement';
comment on column public.body_measurements.weight is 'Body weight in kilograms';
comment on column public.body_measurements.body_fat_percentage is 'Body fat percentage (0-100)';
comment on column public.body_measurements.muscle_percentage is 'Muscle mass percentage (0-100)';

-- note: rls disabled for development - will be enabled in production

