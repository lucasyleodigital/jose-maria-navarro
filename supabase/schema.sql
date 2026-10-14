-- Blog de José María Navarro: tabla de artículos, permisos y almacén de fotos.
-- Ejecutar una sola vez en Supabase > SQL Editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text default '',
  cover_url text,
  content_html text default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  date_label text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

-- Quién puede escribir: solo los correos de esta lista.
create table if not exists public.authors (
  email text primary key
);
-- Sustituir por el correo con el que entrará José María:
insert into public.authors (email) values ('info@soyjosemarianavarro.com') on conflict do nothing;

create or replace function public.is_author() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.authors a where a.email = (auth.jwt() ->> 'email'));
$$;

alter table public.posts enable row level security;
alter table public.authors enable row level security;

drop policy if exists "leer publicados" on public.posts;
create policy "leer publicados" on public.posts for select
  using (status = 'published' or public.is_author());

drop policy if exists "autor escribe" on public.posts;
create policy "autor escribe" on public.posts for all to authenticated
  using (public.is_author()) with check (public.is_author());

-- Fotos del blog: lectura pública, escritura solo del autor.
insert into storage.buckets (id, name, public) values ('blog', 'blog', true) on conflict (id) do nothing;

drop policy if exists "fotos blog lectura" on storage.objects;
create policy "fotos blog lectura" on storage.objects for select using (bucket_id = 'blog');

drop policy if exists "fotos blog autor" on storage.objects;
create policy "fotos blog autor" on storage.objects for all to authenticated
  using (bucket_id = 'blog' and public.is_author())
  with check (bucket_id = 'blog' and public.is_author());
