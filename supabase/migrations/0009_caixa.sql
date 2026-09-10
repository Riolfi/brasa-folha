-- Caixa (PDV interno) — venda de balcão feita pela área administrativa.
-- Reusa orders/order_items. NÃO é caixa fiscal: não emite NFC-e / cupom.
-- 'source' separa a venda do site ('web') da venda no balcão ('caixa').

alter table public.orders
  add column if not exists source text not null default 'web';

alter table public.orders
  drop constraint if exists orders_source_check;
alter table public.orders
  add constraint orders_source_check check (source in ('web', 'caixa'));

create index if not exists orders_source_idx on public.orders(source);

-- ----------------------------------------------------------------------------
-- RPC: registra uma venda de caixa (pedido já `paid`) e baixa o estoque, tudo
-- numa transação. Preço e nome vêm do banco — o cliente só manda product_id e
-- quantidade. Levanta exceção (rollback total) se faltar estoque.
--   p_items: jsonb array de { "product_id": <uuid>, "quantity": <int> }
-- Retorna o id do pedido criado.
-- ----------------------------------------------------------------------------
create or replace function public.caixa_checkout(
  p_order_number text,
  p_method       text,
  p_items        jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_line     record;
  v_prod     public.products%rowtype;
  v_subtotal int := 0;
  v_updated  int;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Venda sem itens.';
  end if;

  insert into public.orders (
    order_number, status, source, customer_name, customer_email,
    subtotal_cents, total_cents, payment_method
  ) values (
    p_order_number, 'paid', 'caixa', 'Consumidor', '',
    0, 0, p_method
  )
  returning id into v_order_id;

  for v_line in
    select (e->>'product_id')::uuid                       as product_id,
           greatest(1, coalesce((e->>'quantity')::int, 1)) as quantity
    from jsonb_array_elements(p_items) e
  loop
    select * into v_prod from public.products
      where id = v_line.product_id
      for update;
    if not found then
      raise exception 'Produto não encontrado no catálogo.';
    end if;

    update public.products
      set stock = stock - v_line.quantity
      where id = v_line.product_id and stock >= v_line.quantity;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Estoque insuficiente para "%".', v_prod.name;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, product_slug, unit_price_cents, quantity
    ) values (
      v_order_id, v_prod.id, v_prod.name, v_prod.slug, v_prod.price_cents, v_line.quantity
    );

    v_subtotal := v_subtotal + v_prod.price_cents * v_line.quantity;
  end loop;

  update public.orders
    set subtotal_cents = v_subtotal,
        total_cents    = v_subtotal
    where id = v_order_id;

  return v_order_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: cancela uma venda de caixa e DEVOLVE o estoque. Idempotente. Só age em
-- pedidos source='caixa' que ainda não estejam 'cancelled'.
-- ----------------------------------------------------------------------------
create or replace function public.cancel_caixa_sale(
  p_order_number text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_line  record;
begin
  select * into v_order from public.orders
    where order_number = p_order_number
    for update;

  if not found then
    return 'not_found';
  end if;
  if v_order.source <> 'caixa' then
    return 'not_caixa';
  end if;
  if v_order.status = 'cancelled' then
    return 'already_cancelled';
  end if;

  for v_line in
    select product_id, quantity from public.order_items where order_id = v_order.id
  loop
    update public.products
      set stock = stock + v_line.quantity
      where id = v_line.product_id;
  end loop;

  update public.orders
    set status = 'cancelled'
    where id = v_order.id;

  return 'cancelled';
end;
$$;
