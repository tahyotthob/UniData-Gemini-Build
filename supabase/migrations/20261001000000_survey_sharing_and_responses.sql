-- Unidata: shareable survey links + response collection.
-- Depends on 20260930000000_auth_and_rls.sql. REVIEW BEFORE APPLYING.

-- 1. Campaigns get a public share slug and an open/closed status.
alter table public.campaigns add column if not exists share_slug text;
alter table public.campaigns add column if not exists status text not null default 'open';
alter table public.campaigns add column if not exists response_limit integer;

update public.campaigns
   set share_slug = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
 where share_slug is null;

alter table public.campaigns
  alter column share_slug set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  alter column share_slug set not null;
create unique index if not exists campaigns_share_slug_key on public.campaigns (share_slug);

-- 2. Responses. Nobody inserts directly: submit_response() validates and inserts.
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  respondent_key text not null,           -- auth uid, or an anonymous browser token
  respondent_id uuid,                     -- auth.uid() when signed in
  answers jsonb not null,
  created_at timestamptz not null default now(),
  unique (campaign_id, respondent_key)    -- one response per respondent per survey
);
create index if not exists responses_campaign_idx on public.responses (campaign_id, created_at desc);

alter table public.responses enable row level security;
drop policy if exists "responses_select_campaign_owner" on public.responses;
create policy "responses_select_campaign_owner" on public.responses for select to authenticated
  using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.researcher_id = auth.uid()));
-- No insert/update/delete policies: writes only via submit_response().

-- 3. Public read of a survey by slug (only what a respondent needs).
create or replace function public.get_public_survey(p_slug text)
returns table (id uuid, title text, questions jsonb, status text)
language sql stable security definer set search_path = public
as $$
  select c.id, c.title, c.questions::jsonb, c.status
  from public.campaigns c
  where c.share_slug = p_slug;
$$;
revoke all on function public.get_public_survey(text) from public;
grant execute on function public.get_public_survey(text) to anon, authenticated;

-- 4. Public submit. Validates survey is open, limit not reached, answers are an array of bounded size.
create or replace function public.submit_response(p_slug text, p_token text, p_answers jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  c public.campaigns;
  v_key text;
begin
  select * into c from public.campaigns where share_slug = p_slug;
  if not found then raise exception 'Survey not found'; end if;
  if c.status <> 'open' then raise exception 'This survey is closed'; end if;
  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 100
     or length(p_answers::text) > 50000 then
    raise exception 'Invalid answers';
  end if;
  if c.response_limit is not null
     and (select count(*) from public.responses r where r.campaign_id = c.id) >= c.response_limit then
    raise exception 'This survey has reached its response limit';
  end if;

  v_key := coalesce(auth.uid()::text, nullif(left(p_token, 64), ''));
  if v_key is null then raise exception 'Missing respondent token'; end if;

  begin
    insert into public.responses (campaign_id, respondent_key, respondent_id, answers)
    values (c.id, v_key, auth.uid(), p_answers);
  exception when unique_violation then
    raise exception 'You have already responded to this survey';
  end;
end;
$$;
revoke all on function public.submit_response(text, text, jsonb) from public;
grant execute on function public.submit_response(text, text, jsonb) to anon, authenticated;
