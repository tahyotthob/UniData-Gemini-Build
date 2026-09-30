-- Unidata: lock down data access for Supabase Auth (email OTP).
-- REVIEW BEFORE APPLYING. Apply with `supabase db push` or the SQL editor.
-- Assumes existing tables `profiles` (unique email) and `campaigns`.

-- 1. Admins live in their own table so users can never self-promote.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies: nobody can read/write via the API. Managed from the SQL editor:
--   insert into public.admins (email) values ('you@example.com');

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. profiles: each user reads/writes only their own row (matched on verified JWT email).
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin_select" on public.profiles;

create policy "profiles_select_own" on public.profiles for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "profiles_admin_select" on public.profiles for select to authenticated
  using (public.is_admin());

-- 3. campaigns: researchers manage their own; nobody reads the table directly as a respondent
--    (respondents use matched_campaigns(), which applies targeting server-side).
alter table public.campaigns add column if not exists researcher_id uuid;
alter table public.campaigns enable row level security;
drop policy if exists "campaigns_select_own" on public.campaigns;
drop policy if exists "campaigns_insert_own" on public.campaigns;
drop policy if exists "campaigns_update_own" on public.campaigns;
drop policy if exists "campaigns_delete_own" on public.campaigns;

create policy "campaigns_select_own" on public.campaigns for select to authenticated
  using (researcher_id = auth.uid());
create policy "campaigns_insert_own" on public.campaigns for insert to authenticated
  with check (researcher_id = auth.uid());
create policy "campaigns_update_own" on public.campaigns for update to authenticated
  using (researcher_id = auth.uid()) with check (researcher_id = auth.uid());
create policy "campaigns_delete_own" on public.campaigns for delete to authenticated
  using (researcher_id = auth.uid());

-- 4. Matching engine in SQL: only returns campaigns that target the caller's profile.
create or replace function public.matched_campaigns()
returns setof public.campaigns
language sql stable security definer set search_path = public
as $$
  select c.*
  from public.campaigns c
  join public.profiles p on lower(p.email) = lower(auth.jwt() ->> 'email')
  where p.role = 'respondent'
    and (coalesce(cardinality(c.target_states), 0) = 0      or p.state     = any (c.target_states))
    and (coalesce(cardinality(c.target_genders), 0) = 0     or p.gender    = any (c.target_genders))
    and (coalesce(cardinality(c.target_age_ranges), 0) = 0  or p.age_range = any (c.target_age_ranges))
  order by c.created_at desc;
$$;
revoke all on function public.matched_campaigns() from public;
grant execute on function public.matched_campaigns() to authenticated;
