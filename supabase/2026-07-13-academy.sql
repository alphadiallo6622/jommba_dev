-- Académie du Mariage — articles gérés depuis la console admin (comme blog_posts)
create table if not exists public.academy_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Conseils pratiques',
  author text not null default 'Équipe Jommba',
  excerpt text,
  content text,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_articles enable row level security;

create policy "Articles académie publiés lisibles par tous"
  on public.academy_articles for select
  using (status = 'published');
