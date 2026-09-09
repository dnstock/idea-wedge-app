alter table public.idea_reviews
add column if not exists narrative text not null default '';
