-- =============================================================================
-- Iarah — status de envio do pedido + código de rastreio
-- Rode DEPOIS de 0002_accounts.sql.
-- =============================================================================

alter table public.orders
  add column if not exists tracking_code text;

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','paid','failed','cancelled','shipped','delivered'));
