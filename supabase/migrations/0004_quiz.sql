-- =============================================================================
-- Iarah — quiz de pele / rotina personalizada
-- Rode DEPOIS de 0003_order_status.sql. Depois rode `npm run seed` (ou
-- supabase/seed.sql) para popular products.attributes.
-- =============================================================================

-- perfil de cada produto para o motor de recomendação
alter table public.products
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- resultados de quiz (salvos por token; user_id opcional)
create table if not exists public.skin_quizzes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  token      text not null unique,
  answers    jsonb not null,
  result     jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists skin_quizzes_user_idx  on public.skin_quizzes(user_id);
create index if not exists skin_quizzes_token_idx on public.skin_quizzes(token);

alter table public.skin_quizzes enable row level security;

-- o cliente logado enxerga os próprios quizzes (usado pelo /conta).
-- Inserção e leitura por token de convidado passam pelo backend (service-role).
drop policy if exists "own quizzes - select" on public.skin_quizzes;
create policy "own quizzes - select" on public.skin_quizzes
  for select using (auth.uid() = user_id);
