-- migration: create new user trigger
-- purpose: automatically create profile record when new user registers
-- affected tables: auth.users, public.profiles
-- important: ensures 1:1 relationship integrity between auth.users and profiles

-- function to handle new user registration
-- creates empty profile record automatically after user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, created_at, updated_at)
  values (new.id, now(), now());
  return new;
end;
$$ language plpgsql security definer;

comment on function public.handle_new_user() is 'Automatically creates profile record for new user registration';

-- trigger to create profile after user registration
-- note: automatically creates profile record on user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

