-- Marca de identidade do banco: diz a qual loja este Supabase pertence.
-- O site e o seed da Visionário se recusam a usar um banco cuja marca não seja
-- 'visionario' (ou que não tenha marca e já tenha produtos — banco de outra loja).
-- Uma linha só (id = true). Sem políticas de RLS: só a service_role lê.
create table if not exists public.store_identity (
  id    boolean primary key default true check (id),
  store text not null
);
alter table public.store_identity enable row level security;
