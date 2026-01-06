-- migration: create dietary goals table
-- purpose: store historical dietary goals for users
-- relationship: 1:N with users (one user can have multiple goals over time)
-- affected tables: dietary_goals

-- create dietary goals table for tracking nutrition targets over time
create table public.dietary_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  activity_level text,
  calories_target integer not null,
  protein_target integer not null,
  fat_target integer not null,
  carbs_target integer not null,
  fiber_target integer,
  tdee integer,
  bmr integer,
  created_at timestamptz not null default now(),
  
  -- constraints: all target values must be non-negative
  constraint positive_targets check (
    calories_target >= 0 and
    protein_target >= 0 and
    fat_target >= 0 and
    carbs_target >= 0 and
    (fiber_target is null or fiber_target >= 0) and
    (tdee is null or tdee >= 0) and
    (bmr is null or bmr >= 0)
  )
);

comment on table public.dietary_goals is 'Historical dietary goals allowing changes over time without losing context';
comment on column public.dietary_goals.start_date is 'Date from which this goal is active';
comment on column public.dietary_goals.activity_level is 'Physical activity level for this period';
comment on column public.dietary_goals.calories_target is 'Daily calorie goal in kcal';
comment on column public.dietary_goals.protein_target is 'Daily protein goal in grams';
comment on column public.dietary_goals.fat_target is 'Daily fat goal in grams';
comment on column public.dietary_goals.carbs_target is 'Daily carbohydrates goal in grams';
comment on column public.dietary_goals.fiber_target is 'Daily fiber goal in grams';
comment on column public.dietary_goals.tdee is 'Total Daily Energy Expenditure (calculated)';
comment on column public.dietary_goals.bmr is 'Basal Metabolic Rate (calculated)';

-- note: rls disabled for development - will be enabled in production

