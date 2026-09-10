-- =============================================================================
-- Iarah — conteúdo editável do site (home CTA do quiz, "mais queridos", rodapé,
-- páginas Sobre e Contato, dados de atendimento).
-- Rode DEPOIS de 0006_categories.sql. Depois `npm run seed` popula os textos
-- padrão (não sobrescreve edições existentes).
-- =============================================================================

create table if not exists public.site_content (
  section    text primary key,
  is_active  boolean not null default true,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site_content readable" on public.site_content;
create policy "site_content readable" on public.site_content
  for select using (true);
-- escrita: somente via service-role (backend)
