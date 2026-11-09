alter table public.admin_users enable row level security;

drop policy if exists admin_users_select_self on public.admin_users;
create policy admin_users_select_self
  on public.admin_users
  for select
  to authenticated
  using (lower(email) = lower((select auth.jwt() ->> 'email')));
