-- migration: create base helper functions
-- purpose: create reusable trigger function for updating updated_at timestamp
-- affected: all tables with updated_at column

-- function to automatically update updated_at column on record modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function public.handle_updated_at() is 'Automatically updates updated_at timestamp on record modification';

