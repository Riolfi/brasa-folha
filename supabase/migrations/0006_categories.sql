-- =============================================================================
-- Iarah — categorias em árvore de 2 níveis (categoria → subcategoria)
-- Produto pertence sempre a uma subcategoria (nível 2), nunca a uma raiz.
-- Rode DEPOIS de 0005_offers.sql. Depois `npm run seed`.
-- =============================================================================

alter table public.categories
  add column if not exists image_url text not null default '';

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete cascade;

-- limpeza de colunas de versões anteriores nunca aplicadas
alter table public.categories drop column if exists links;
alter table public.categories drop column if exists subcategories;

create index if not exists categories_parent_idx on public.categories(parent_id);

-- ----------------------------------------------------------------------------
-- Guard: a árvore tem no máximo 2 níveis
-- ----------------------------------------------------------------------------
create or replace function public.categories_depth_guard()
returns trigger language plpgsql as $$
begin
  if new.parent_id is not null then
    if new.parent_id = new.id then
      raise exception 'Uma categoria não pode ser pai de si mesma';
    end if;
    if exists (select 1 from public.categories where id = new.parent_id and parent_id is not null) then
      raise exception 'Só é permitido 2 níveis: a subcategoria não pode ter subcategorias';
    end if;
    if exists (select 1 from public.categories where parent_id = new.id) then
      raise exception 'Esta categoria tem subcategorias — não pode virar subcategoria';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists categories_depth on public.categories;
create trigger categories_depth before insert or update on public.categories
  for each row execute function public.categories_depth_guard();

-- ----------------------------------------------------------------------------
-- Guard: produto só pode apontar para uma subcategoria (nível 2)
-- ----------------------------------------------------------------------------
create or replace function public.products_subcategory_guard()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.categories where id = new.category_id and parent_id is not null
  ) then
    raise exception 'O produto deve pertencer a uma subcategoria (categoria de nível 2)';
  end if;
  return new;
end;
$$;

drop trigger if exists products_subcategory on public.products;
create trigger products_subcategory before insert or update on public.products
  for each row execute function public.products_subcategory_guard();
