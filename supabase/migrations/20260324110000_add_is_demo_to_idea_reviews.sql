alter table public.idea_reviews
add column if not exists is_demo boolean not null default false;
