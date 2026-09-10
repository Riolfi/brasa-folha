-- =============================================================================
-- Iarah — schema inicial
-- Rode no SQL Editor do Supabase (ou via `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text not null default '',
  position     int  not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.products (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  name                   text not null,
  category_id            uuid not null references public.categories(id) on delete restrict,
  short_description      text not null default '',
  description            text not null default '',
  ingredients            text not null default '',
  how_to_use             text not null default '',
  price_cents            int  not null check (price_cents >= 0),
  compare_at_price_cents int  check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  stock                  int  not null default 0 check (stock >= 0),
  is_active              boolean not null default true,
  is_bestseller          boolean not null default false,
  rating                 numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  reviews_count          int not null default 0,
  images                 jsonb not null default '[]'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(is_active);

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  status            text not null default 'pending'
                      check (status in ('pending','paid','failed','cancelled')),
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text not null default '',
  customer_cpf      text not null default '',
  shipping_cep      text not null default '',
  shipping_address  jsonb not null default '{}'::jsonb,
  shipping_cents    int not null default 0 check (shipping_cents >= 0),
  subtotal_cents    int not null check (subtotal_cents >= 0),
  total_cents       int not null check (total_cents >= 0),
  payment_method    text,
  mp_payment_id     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid not null references public.products(id) on delete restrict,
  product_name     text not null,
  product_slug     text,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity         int not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- RPC: confirmar pagamento + decrementar estoque (atômico e idempotente)
-- Executa com privilégios do dono (security definer) e é chamada só pelo
-- backend com a service-role key.
-- ----------------------------------------------------------------------------

create or replace function public.confirm_order_payment(
  p_order_number text,
  p_payment_id   text,
  p_method       text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order   public.orders%rowtype;
  v_item    record;
  v_updated int;
begin
  select * into v_order from public.orders
    where order_number = p_order_number
    for update;

  if not found then
    return 'not_found';
  end if;

  -- idempotência: se já está pago, não faz nada
  if v_order.status = 'paid' then
    return 'already_paid';
  end if;

  for v_item in
    select product_id, quantity from public.order_items where order_id = v_order.id
  loop
    update public.products
      set stock = stock - v_item.quantity
      where id = v_item.product_id and stock >= v_item.quantity;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Estoque insuficiente para o produto % no pedido %',
        v_item.product_id, p_order_number;
    end if;
  end loop;

  update public.orders
    set status = 'paid',
        payment_method = p_method,
        mp_payment_id = coalesce(p_payment_id, mp_payment_id)
    where id = v_order.id;

  return 'confirmed';
end;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Catálogo: leitura pública
drop policy if exists "categories readable" on public.categories;
create policy "categories readable" on public.categories
  for select using (true);

drop policy if exists "active products readable" on public.products;
create policy "active products readable" on public.products
  for select using (is_active = true);

-- orders / order_items: nenhuma política para anon/authenticated =>
-- acesso somente via service-role key (que ignora RLS) no backend.
