-- Run this once in Supabase → SQL Editor. It sets up who may enter the admin area.
-- Sign-up is NOT used: create each admin by hand (Authentication → Users → Add user),
-- turn OFF "Allow new users to sign up" (Authentication → Sign In / Providers → Email),
-- then add that user's id to admin_users with the insert at the bottom.

create table if not exists public.admin_users (
  user_id   uuid primary key references auth.users on delete cascade,
  email     text,
  full_name text,
  role      text not null default 'admin'
);

alter table public.admin_users enable row level security;

-- A signed-in user may read ONLY their own row (this is how the site checks "am I an admin?").
drop policy if exists "read own admin row" on public.admin_users;
create policy "read own admin row" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Helper for later table policies (products, orders, ...): is_admin()
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Add yourself (replace the id and email with the user you created):
-- insert into public.admin_users (user_id, email, full_name) values ('00000000-0000-0000-0000-000000000000', 'you@example.com', 'Owner');
