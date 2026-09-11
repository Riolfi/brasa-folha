-- Imagem separada para mobile no slide do carrossel (retrato). O app já lê
-- `image_url_mobile` (OffersCarousel, repo/site.rowToOffer) e o form do admin
-- salva; faltava a coluna.
alter table public.offers add column if not exists image_url_mobile text not null default '';
