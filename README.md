# Brasa & Folha

E-commerce da **Brasa & Folha** — tabacaria com curadoria (narguilé, sedas, dichavadores
e acessórios). Catálogo dinâmico, carrinho, checkout com Pix e cartão parcelado, e-mail
transacional, painel administrativo e **Caixa (PDV interno)** para a venda de balcão.

Nasceu como fork do motor da Iarah (loja de skincare, `~/projetos/iarah`) — daí a base
compartilhada. Aqui o catálogo/tema/conteúdo da tabacaria é o padrão, sem o sistema de
"perfis de nicho".

Funciona **ponta a ponta desde o primeiro `npm run dev`**: sem chaves de API, o site usa
um catálogo local, um pagamento simulado e grava os e-mails em disco. Conforme você
preenche o `.env`, cada serviço real entra no lugar. Ver **[SETUP.md](./SETUP.md)**.

> O **Caixa** (`/admin/caixa`) é a única parte que exige Supabase — ele registra venda e
> baixa estoque numa transação no banco.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Astro 5 (SSR `output: 'server'`) + TypeScript strict |
| Estilo | Tailwind CSS (tema em `src/data/theme.json`) · Bricolage Grotesque + Space Grotesk + Bungee (self-hosted) |
| Ilhas interativas | Preact + nanostores (carrinho persistido em `localStorage`) |
| Banco | Supabase (Postgres + RLS) |
| Pagamento | Mercado Pago Checkout Bricks (Pix + cartão em até 6x) |
| E-mail | Resend |
| Deploy | Vercel (`@astrojs/vercel`) |

## Rodando

```bash
npm install
cp .env.example .env
npm run dev
```

| Comando | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run preview` | serve o build localmente |
| `npm run seed` | popula o Supabase com `src/data/*.json` (precisa das chaves) |
| `npm run typecheck` | `astro check` |

## Caixa (PDV interno)

`/admin/caixa` — venda de balcão: bipa o produto no leitor de código de barras, monta a
venda (qty++ em repetido), total correndo, forma de pagamento, valor recebido → troco, e
finaliza. Registra um pedido `paid` com `source='caixa'` e **baixa o estoque numa
transação** (RPC `caixa_checkout`) — se a loja online e o caixa venderem o último item ao
mesmo tempo, um dos dois falha na hora, nunca fica negativo. A tela de resumo tem
"cancelar venda", que devolve o estoque (`cancel_caixa_sale`).

**Não é caixa fiscal** — não emite NFC-e / cupom. É controle interno de venda e estoque.

O leitor USB/Bluetooth "digita" os dígitos + Enter no campo focado — sem câmera nem API.
Cada produto ganha um campo "Código de barras" (EAN/UPC) no `/admin`.

## Estrutura

```
src/
  components/        UI (.astro) + ilhas (.tsx: carrinho, galeria, checkout, admin, CaixaFlow)
  layouts/           BaseLayout, AdminLayout, LegalLayout
  lib/
    repo/            acesso a dados (catalog.ts, orders.ts, account.ts, quiz.ts, site.ts)
    quiz/            motor de rotina por regras (desligado por padrão — PUBLIC_QUIZ_ENABLED)
    cart.ts          stores do carrinho
    mercadopago.ts   pagamento (real ou simulado)
    email.ts         Resend (ou arquivo)
    fulfillment.ts   pipeline "pedido pago" (estoque + e-mail), idempotente
    auth.ts          sessão do admin (cookie HMAC)
    supabase-server.ts  client Supabase por-request (@supabase/ssr)
  middleware.ts      protege /admin, /conta e injeta locals.user/supabase/site/brand
  pages/
    index, loja, produto/[slug], checkout, pedido/confirmado
    sobre, contato, politica-trocas, termos, privacidade
    entrar, cadastrar, auth/callback, auth/sair, conta/*
    api/             orders, payments, webhooks/mercadopago, cep, contact,
                     auth/*, account/*, admin/* (inclui admin/caixa e admin/products/by-barcode)
    admin/           painel, Caixa, CRUD de produtos, pedidos, ofertas, categorias, site/
supabase/
  all.sql                        as 9 migrations num arquivo só (projeto novo)
  migrations/0001..0007          schema, contas, status, quiz, ofertas, categorias, conteúdo
  migrations/0008_barcode.sql    products.barcode (EAN/UPC, único)
  migrations/0009_caixa.sql      orders.source + RPCs caixa_checkout / cancel_caixa_sale
  seed.sql                       catálogo (gerado de src/data/catalog.json)
```

## Conteúdo editável (`/admin` → Conteúdo)

Seções da home, logotipo do cabeçalho, rodapé, páginas **Sobre** e **Contato** e os dados
de atendimento são editados em `/admin/site`, sem tocar no código. Guardados na tabela
`site_content` (fallback: `.data/site.json`); os textos padrão vêm de
`src/data/site-content.default.json` e cada seção tem "restaurar padrão".

## Favoritos

Coração nos cards e na página do produto salva em `localStorage` (`iarah:favorites:v1`,
store nanostores em `src/lib/favorites.ts`) — funciona deslogado.

## Contas de cliente

Área `/conta` via **Supabase Auth** (e-mail/senha + Google). Só aparece quando o Supabase
está configurado; sem ele, o checkout funciona 100% como convidado. Ver SETUP.md.

## Modo fallback vs. produção

| | Sem `.env` (fallback) | Com chaves |
|---|---|---|
| Catálogo | `src/data/catalog.json` | Supabase |
| Pedidos | `.data/orders.json` | Supabase (`orders`, `order_items`) |
| Pagamento | botão "simular" aprova na hora | Pix + cartão via Mercado Pago |
| E-mail | `.data/emails/*.html` | Resend |
| Admin (edição) | grava em `.data/` (só local) | Supabase |
| **Caixa** | **indisponível** | Supabase |
| Contas de cliente (`/conta`) | desligadas | Supabase Auth |

> Em produção serverless o `.data/` é somente-leitura, então **Supabase é obrigatório**.

## SEO & performance

- Meta tags + Open Graph por página (`SEO.astro`), `canonical`, `og:locale=pt_BR`
- `sitemap-index.xml`, `robots.txt`
- JSON-LD: `Organization`, `Product` + `Offer` + `BreadcrumbList`, `ItemList`
- Imagens responsivas com `srcset` e `loading="lazy"`; fontes self-hosted
