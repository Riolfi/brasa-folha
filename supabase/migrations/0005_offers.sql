-- =============================================================================
-- Iarah — carrossel de ofertas da home
-- Rode DEPOIS de 0004_quiz.sql. Depois `npm run seed` popula os slides padrão.
-- =============================================================================

create table if not exists public.offers (
  id         uuid primary key default gen_random_uuid(),
  position   int not null default 0,
  is_active  boolean not null default true,
  image_url  text not null default '',
  eyebrow    text not null default '',
  title      text not null default '',
  subtitle   text not null default '',
  cta_label  text not null default '',
  cta_href   text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_position_idx on public.offers(position);

drop trigger if exists offers_touch on public.offers;
create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();

alter table public.offers enable row level security;

drop policy if exists "active offers readable" on public.offers;
create policy "active offers readable" on public.offers
  for select using (is_active = true);
-- escrita: somente via service-role (backend)
