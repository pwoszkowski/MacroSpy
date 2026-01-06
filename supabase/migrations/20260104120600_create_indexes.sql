-- migration: create performance indexes
-- purpose: optimize queries for dashboard and history views
-- affected tables: meals, dietary_goals, body_measurements
-- rationale: composite indexes on (user_id, date) improve query performance for user-specific data retrieval

-- index for meals: critical for fetching today's meals and meal history
-- composite index on user_id and consumed_at (descending) for efficient filtering and sorting
create index idx_meals_user_consumed 
  on public.meals(user_id, consumed_at desc);

comment on index idx_meals_user_consumed is 'Optimizes queries for user meals filtered by consumption time';

-- index for dietary goals: fast lookup of current goal
-- composite index on user_id and start_date (descending) for finding active goal
create index idx_goals_user_start 
  on public.dietary_goals(user_id, start_date desc);

comment on index idx_goals_user_start is 'Optimizes queries for finding current active dietary goal';

-- index for body measurements: efficient retrieval of measurement history
-- composite index on user_id and date (descending) for timeline queries
create index idx_measurements_user_date 
  on public.body_measurements(user_id, date desc);

comment on index idx_measurements_user_date is 'Optimizes queries for user body measurements over time';

