/**
 * Gera supabase/seed.sql a partir de src/data/catalog.json.
 *   node scripts/gen-seed-sql.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf-8'));
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? 'null' : String(v));
const b = (v) => (v ? 'true' : 'false');
const catBySlug = new Map(catalog.categories.map((c) => [c.slug, c.id]));

const newIds = catalog.categories.map((c) => q(c.id)).join(', ');

let out = `-- =============================================================================
-- Iarah — seed do catálogo (gerado de src/data/catalog.json)
-- Rode DEPOIS de 0001..0006. Idempotente. Migra bancos já populados:
-- renomeia categorias antigas, insere a nova árvore, remapeia produtos e
-- depois apaga as antigas.
-- =============================================================================

-- 1. libera os slugs das categorias antigas que não estão na nova árvore
update public.categories
  set slug = slug || '__legacy'
  where id not in (${newIds}) and slug not like '%\\_\\_legacy';

-- 2. insere/atualiza a nova árvore (raízes antes das subcategorias, por FK)
`;

const orderedCats = [
  ...catalog.categories.filter((c) => !c.parent_id),
  ...catalog.categories.filter((c) => c.parent_id),
];
out += 'insert into public.categories (id, slug, name, description, position, image_url, parent_id) values\n';
out += orderedCats
  .map(
    (c) =>
      `  (${q(c.id)}, ${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${n(c.position)}, ${q(c.image_url ?? '')}, ${c.parent_id ? q(c.parent_id) : 'null'})`,
  )
  .join(',\n');
out += `
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  position = excluded.position, image_url = excluded.image_url, parent_id = excluded.parent_id;

-- 3. produtos (category_id já aponta para a subcategoria nova)
`;

out += `insert into public.products
  (id, slug, name, category_id, short_description, description, ingredients, how_to_use,
   price_cents, compare_at_price_cents, stock, is_active, is_bestseller, rating, reviews_count,
   images, attributes)
values
`;
out += catalog.products
  .map((p) => {
    const images = `'${JSON.stringify(p.images).replace(/'/g, "''")}'::jsonb`;
    const attributes = `'${JSON.stringify(p.attributes ?? {}).replace(/'/g, "''")}'::jsonb`;
    return `  (${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(catBySlug.get(p.category_slug))},
   ${q(p.short_description)}, ${q(p.description)}, ${q(p.ingredients)}, ${q(p.how_to_use)},
   ${n(p.price_cents)}, ${n(p.compare_at_price_cents)}, ${n(p.stock)}, ${b(p.is_active)}, ${b(p.is_bestseller)},
   ${n(p.rating)}, ${n(p.reviews_count)}, ${images}, ${attributes})`;
  })
  .join(',\n');
out += `
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  ingredients = excluded.ingredients,
  how_to_use = excluded.how_to_use,
  price_cents = excluded.price_cents,
  compare_at_price_cents = excluded.compare_at_price_cents,
  stock = excluded.stock,
  is_active = excluded.is_active,
  is_bestseller = excluded.is_bestseller,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  images = excluded.images,
  attributes = excluded.attributes;

-- 4. remove as categorias antigas (nada mais aponta para elas)
delete from public.categories where slug like '%\\_\\_legacy';
`;

// ----- ofertas padrão do carrossel -----
const offers = JSON.parse(await readFile(new URL('../src/data/offers.default.json', import.meta.url), 'utf-8'));
out += `

insert into public.offers
  (id, position, is_active, image_url, eyebrow, title, subtitle, cta_label, cta_href)
values
`;
out += offers
  .map(
    (o) =>
      `  (${q(o.id)}, ${n(o.position)}, ${b(o.is_active)}, ${q(o.image_url)}, ${q(o.eyebrow)}, ${q(o.title)}, ${q(o.subtitle)}, ${q(o.cta_label)}, ${q(o.cta_href)})`,
  )
  .join(',\n');
out += `
on conflict (id) do nothing;
`;

// ----- conteúdo editável do site (textos padrão) -----
const siteContent = JSON.parse(
  await readFile(new URL('../src/data/site-content.default.json', import.meta.url), 'utf-8'),
);
out += `

insert into public.site_content (section, is_active, data) values
`;
out += Object.entries(siteContent)
  .map(
    ([section, v]) =>
      `  (${q(section)}, ${b(v.is_active)}, '${JSON.stringify(v.data).replace(/'/g, "''")}'::jsonb)`,
  )
  .join(',\n');
out += `
on conflict (section) do nothing;
`;

await writeFile(new URL('../supabase/seed.sql', import.meta.url), out, 'utf-8');
console.log('✓ supabase/seed.sql gerado');
