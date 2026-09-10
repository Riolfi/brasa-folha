-- Código de barras (EAN/UPC) por produto — leitor no cadastro (Produtos) e,
-- depois, no Caixa. Único quando presente; NULLs não conflitam entre si (a
-- própria constraint unique já cria o índice de busca).
alter table public.products add column if not exists barcode text;
alter table public.products add constraint products_barcode_key unique (barcode);
