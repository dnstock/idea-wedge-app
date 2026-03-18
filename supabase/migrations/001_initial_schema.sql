create extension if not exists pgcrypto;

create table if not exists public.idea_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default '',
  idea_name text not null default '',
  summary text not null default '',
  owner_name text not null default '',
  status text not null default 'researching',
  tags text not null default '',
  category text not null default '',
  competitors text not null default '',
  proof text not null default '',
  market_score text not null default 'unknown',
  problem text not null default '',
  improvement text not null default '',
  evidence text not null default '',
  wedge_score text not null default 'unknown',
  core text not null default '',
  out_of_scope text not null default '',
  complexity text not null default '',
  mvp_score text not null default 'unknown',
  buyer text not null default '',
  channel text not null default '',
  message text not null default '',
  proof_point text not null default '',
  distribution_score text not null default 'unknown',
  dependencies text not null default '',
  kill_shot text not null default '',
  mitigation text not null default '',
  risk_score text not null default 'unknown',
  decision text,
  overall_score integer not null default 0
);

create table if not exists public.idea_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  review_id uuid not null references public.idea_reviews(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default '',
  body text not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'idea_reviews_set_updated_at'
  ) then
    create trigger idea_reviews_set_updated_at
    before update on public.idea_reviews
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;

alter table public.idea_reviews enable row level security;
alter table public.idea_comments enable row level security;

create policy "authenticated users can read reviews"
on public.idea_reviews
for select
using (auth.role() = 'authenticated');

create policy "authenticated users can insert reviews"
on public.idea_reviews
for insert
with check (auth.role() = 'authenticated');

create policy "authenticated users can update reviews"
on public.idea_reviews
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated users can delete reviews"
on public.idea_reviews
for delete
using (auth.role() = 'authenticated');

create policy "authenticated users can read comments"
on public.idea_comments
for select
using (auth.role() = 'authenticated');

create policy "authenticated users can insert comments"
on public.idea_comments
for insert
with check (auth.role() = 'authenticated');

create policy "authenticated users can delete comments"
on public.idea_comments
for delete
using (auth.role() = 'authenticated');
