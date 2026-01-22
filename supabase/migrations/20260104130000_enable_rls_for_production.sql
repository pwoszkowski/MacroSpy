-- migration: enable row level security for production
-- purpose: enable rls and create security policies for all tables
-- affected tables: profiles, dietary_goals, meals, body_measurements
-- security: implements strict data isolation per user (auth.uid() = user_id)

-- enable rls for all tables
alter table public.profiles enable row level security;
alter table public.dietary_goals enable row level security;
alter table public.meals enable row level security;
alter table public.body_measurements enable row level security;

-- policies for profiles table
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- policies for dietary_goals table
create policy dietary_goals_select_own
  on public.dietary_goals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy dietary_goals_insert_own
  on public.dietary_goals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy dietary_goals_update_own
  on public.dietary_goals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy dietary_goals_delete_own
  on public.dietary_goals
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- policies for meals table
create policy meals_select_own
  on public.meals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy meals_insert_own
  on public.meals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy meals_update_own
  on public.meals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy meals_delete_own
  on public.meals
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- policies for body_measurements table
create policy body_measurements_select_own
  on public.body_measurements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy body_measurements_insert_own
  on public.body_measurements
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy body_measurements_update_own
  on public.body_measurements
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy body_measurements_delete_own
  on public.body_measurements
  for delete
  to authenticated
  using (auth.uid() = user_id);