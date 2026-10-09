-- Acesso à área administrativa passa a usar a mesma conta de cliente
-- (Supabase Auth) em vez de uma senha única compartilhada. Uma conta é admin
-- quando tem uma linha aqui — nunca um campo em `profiles` (que o próprio
-- dono da conta pode editar via RLS): promover alguém a admin tem que ser
-- sempre uma ação manual no banco, nunca alcançável por nenhuma API pública.

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Contas com acesso a /admin. Inserir manualmente (SQL editor ou service role) — nunca via API pública.';

alter table public.admin_users enable row level security;
-- De propósito, nenhuma policy: sem policy, só o client service-role
-- (que ignora RLS) consegue ler ou escrever essa tabela.

-- Depois de rodar esta migration, promova sua própria conta:
--   insert into public.admin_users (user_id)
--   values ('<seu-user-id-do-auth.users>');
