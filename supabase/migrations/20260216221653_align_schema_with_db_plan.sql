-- migration: align public schema with current db plan
-- purpose: add missing favorite_meals table and enforce explicit, granular rls policies for anon and authenticated roles
-- affected tables: public.favorite_meals, public.profiles, public.dietary_goals, public.meals, public.body_measurements
-- affected objects: indexes, trigger, row level security policies
-- special notes:
-- 1) this migration intentionally drops existing policies before recreating them with stricter naming and role separation.
-- 2) no user data is deleted; drop operations target security policy objects only.

-- step 1: create the missing favorite_meals table from the db plan.
-- this table stores user-owned snapshots of favorite meal macros for quick reuse.
create table if not exists public.favorite_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  calories integer not null,
  protein numeric(10, 1) not null,
  fat numeric(10, 1) not null,
  carbs numeric(10, 1) not null,
  fiber numeric(10, 1) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint favorite_meals_macros_check check (
    calories >= 0 and
    protein >= 0 and
    fat >= 0 and
    carbs >= 0 and
    fiber >= 0
  )
);

comment on table public.favorite_meals is 'user-owned meal templates stored as independent snapshots';
comment on column public.favorite_meals.user_id is 'owner user id; references public.profiles(id)';
comment on column public.favorite_meals.name is 'template name for quick meal creation';
comment on column public.favorite_meals.calories is 'template calories in kcal';
comment on column public.favorite_meals.protein is 'template protein in grams';
comment on column public.favorite_meals.fat is 'template fat in grams';
comment on column public.favorite_meals.carbs is 'template carbohydrates in grams';
comment on column public.favorite_meals.fiber is 'template fiber in grams';

-- step 2: ensure updated_at automation exists for favorite_meals.
-- drop/create is used because postgresql does not provide create trigger if not exists.
-- destructive note: dropping this trigger is safe because it affects only trigger metadata, not table data.
drop trigger if exists favorite_meals_updated_at on public.favorite_meals;
create trigger favorite_meals_updated_at
  before update on public.favorite_meals
  for each row
  execute function public.handle_updated_at();

-- step 3: create missing indexes for favorite_meals query patterns from the plan.
create index if not exists idx_favorites_user_created
  on public.favorite_meals(user_id, created_at desc);
create index if not exists idx_favorites_user_name
  on public.favorite_meals(user_id, name);

comment on index idx_favorites_user_created is 'optimizes default favorites listing by newest first';
comment on index idx_favorites_user_name is 'optimizes search and alphabetical sorting of favorites';

-- step 4: enable rls on all private user data tables.
alter table public.profiles enable row level security;
alter table public.dietary_goals enable row level security;
alter table public.meals enable row level security;
alter table public.favorite_meals enable row level security;
alter table public.body_measurements enable row level security;

-- step 5: replace older policies with explicit role-scoped policies.
-- destructive note: policy drops are intentional and safe for data integrity; they only change authorization rules.

-- profiles
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists profiles_insert_authenticated on public.profiles;
drop policy if exists profiles_update_authenticated on public.profiles;
drop policy if exists profiles_delete_authenticated on public.profiles;
drop policy if exists profiles_select_anon on public.profiles;
drop policy if exists profiles_insert_anon on public.profiles;
drop policy if exists profiles_update_anon on public.profiles;
drop policy if exists profiles_delete_anon on public.profiles;

-- authenticated policies: owner-only access for application users.
create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_insert_authenticated
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy profiles_update_authenticated
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_delete_authenticated
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- anon policies: explicit deny to protect private profile data.
create policy profiles_select_anon
  on public.profiles
  for select
  to anon
  using (false);

create policy profiles_insert_anon
  on public.profiles
  for insert
  to anon
  with check (false);

create policy profiles_update_anon
  on public.profiles
  for update
  to anon
  using (false)
  with check (false);

create policy profiles_delete_anon
  on public.profiles
  for delete
  to anon
  using (false);

-- dietary_goals
drop policy if exists dietary_goals_select_own on public.dietary_goals;
drop policy if exists dietary_goals_insert_own on public.dietary_goals;
drop policy if exists dietary_goals_update_own on public.dietary_goals;
drop policy if exists dietary_goals_delete_own on public.dietary_goals;
drop policy if exists dietary_goals_select_authenticated on public.dietary_goals;
drop policy if exists dietary_goals_insert_authenticated on public.dietary_goals;
drop policy if exists dietary_goals_update_authenticated on public.dietary_goals;
drop policy if exists dietary_goals_delete_authenticated on public.dietary_goals;
drop policy if exists dietary_goals_select_anon on public.dietary_goals;
drop policy if exists dietary_goals_insert_anon on public.dietary_goals;
drop policy if exists dietary_goals_update_anon on public.dietary_goals;
drop policy if exists dietary_goals_delete_anon on public.dietary_goals;

-- authenticated policies: owner-only access via user_id.
create policy dietary_goals_select_authenticated
  on public.dietary_goals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy dietary_goals_insert_authenticated
  on public.dietary_goals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy dietary_goals_update_authenticated
  on public.dietary_goals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy dietary_goals_delete_authenticated
  on public.dietary_goals
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- anon policies: explicit deny to keep goals private.
create policy dietary_goals_select_anon
  on public.dietary_goals
  for select
  to anon
  using (false);

create policy dietary_goals_insert_anon
  on public.dietary_goals
  for insert
  to anon
  with check (false);

create policy dietary_goals_update_anon
  on public.dietary_goals
  for update
  to anon
  using (false)
  with check (false);

create policy dietary_goals_delete_anon
  on public.dietary_goals
  for delete
  to anon
  using (false);

-- meals
drop policy if exists meals_select_own on public.meals;
drop policy if exists meals_insert_own on public.meals;
drop policy if exists meals_update_own on public.meals;
drop policy if exists meals_delete_own on public.meals;
drop policy if exists meals_select_authenticated on public.meals;
drop policy if exists meals_insert_authenticated on public.meals;
drop policy if exists meals_update_authenticated on public.meals;
drop policy if exists meals_delete_authenticated on public.meals;
drop policy if exists meals_select_anon on public.meals;
drop policy if exists meals_insert_anon on public.meals;
drop policy if exists meals_update_anon on public.meals;
drop policy if exists meals_delete_anon on public.meals;

-- authenticated policies: owner-only access via user_id.
create policy meals_select_authenticated
  on public.meals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy meals_insert_authenticated
  on public.meals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy meals_update_authenticated
  on public.meals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy meals_delete_authenticated
  on public.meals
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- anon policies: explicit deny because meal history is sensitive.
create policy meals_select_anon
  on public.meals
  for select
  to anon
  using (false);

create policy meals_insert_anon
  on public.meals
  for insert
  to anon
  with check (false);

create policy meals_update_anon
  on public.meals
  for update
  to anon
  using (false)
  with check (false);

create policy meals_delete_anon
  on public.meals
  for delete
  to anon
  using (false);

-- favorite_meals
drop policy if exists favorite_meals_select_authenticated on public.favorite_meals;
drop policy if exists favorite_meals_insert_authenticated on public.favorite_meals;
drop policy if exists favorite_meals_update_authenticated on public.favorite_meals;
drop policy if exists favorite_meals_delete_authenticated on public.favorite_meals;
drop policy if exists favorite_meals_select_anon on public.favorite_meals;
drop policy if exists favorite_meals_insert_anon on public.favorite_meals;
drop policy if exists favorite_meals_update_anon on public.favorite_meals;
drop policy if exists favorite_meals_delete_anon on public.favorite_meals;

-- authenticated policies: owner-only access for favorite snapshots.
create policy favorite_meals_select_authenticated
  on public.favorite_meals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy favorite_meals_insert_authenticated
  on public.favorite_meals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy favorite_meals_update_authenticated
  on public.favorite_meals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy favorite_meals_delete_authenticated
  on public.favorite_meals
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- anon policies: explicit deny to protect private templates.
create policy favorite_meals_select_anon
  on public.favorite_meals
  for select
  to anon
  using (false);

create policy favorite_meals_insert_anon
  on public.favorite_meals
  for insert
  to anon
  with check (false);

create policy favorite_meals_update_anon
  on public.favorite_meals
  for update
  to anon
  using (false)
  with check (false);

create policy favorite_meals_delete_anon
  on public.favorite_meals
  for delete
  to anon
  using (false);

-- body_measurements
drop policy if exists body_measurements_select_own on public.body_measurements;
drop policy if exists body_measurements_insert_own on public.body_measurements;
drop policy if exists body_measurements_update_own on public.body_measurements;
drop policy if exists body_measurements_delete_own on public.body_measurements;
drop policy if exists body_measurements_select_authenticated on public.body_measurements;
drop policy if exists body_measurements_insert_authenticated on public.body_measurements;
drop policy if exists body_measurements_update_authenticated on public.body_measurements;
drop policy if exists body_measurements_delete_authenticated on public.body_measurements;
drop policy if exists body_measurements_select_anon on public.body_measurements;
drop policy if exists body_measurements_insert_anon on public.body_measurements;
drop policy if exists body_measurements_update_anon on public.body_measurements;
drop policy if exists body_measurements_delete_anon on public.body_measurements;

-- authenticated policies: owner-only access via user_id.
create policy body_measurements_select_authenticated
  on public.body_measurements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy body_measurements_insert_authenticated
  on public.body_measurements
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy body_measurements_update_authenticated
  on public.body_measurements
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy body_measurements_delete_authenticated
  on public.body_measurements
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- anon policies: explicit deny to protect sensitive body metrics.
create policy body_measurements_select_anon
  on public.body_measurements
  for select
  to anon
  using (false);

create policy body_measurements_insert_anon
  on public.body_measurements
  for insert
  to anon
  with check (false);

create policy body_measurements_update_anon
  on public.body_measurements
  for update
  to anon
  using (false)
  with check (false);

create policy body_measurements_delete_anon
  on public.body_measurements
  for delete
  to anon
  using (false);
