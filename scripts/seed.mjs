/**
 * Popula o Supabase com o catálogo, ofertas e conteúdo do site.
 *
 *   1. configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
 *   2. rode as migrations (supabase/migrations/0001.. ou supabase/all.sql)
 *   3. npm run seed
 *
 * É idempotente: usa upsert por `slug`.
 */
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('✗ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes de rodar o seed.');
  process.exit(1);
}

const dataDir = new URL('../src/data/', import.meta.url);
const loadData = async (name) => JSON.parse(await readFile(new URL(name, dataDir), 'utf-8'));

const catalog = await loadData('catalog.json');
const sb = createClient(url, key, { auth: { persistSession: false } });

console.log(`→ ${catalog.categories.length} categorias, ${catalog.products.length} produtos`);

const catRow = (c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  description: c.description,
  position: c.position,
  image_url: c.image_url ?? '',
  parent_id: c.parent_id ?? null,
});

const newIds = new Set(catalog.categories.map((c) => c.id));
const die = (label, e) => {
  console.error(`✗ ${label}:`, e.message);
  process.exit(1);
};

// 1. libera os slugs: renomeia categorias antigas que NÃO estão na nova árvore
const { data: existing } = await sb.from('categories').select('id, slug');
const legacy = (existing ?? []).filter((c) => !newIds.has(c.id) && !c.slug.endsWith('__legacy'));
for (const c of legacy) {
  const { error } = await sb.from('categories').update({ slug: `${c.slug}__legacy` }).eq('id', c.id);
  if (error) die('categorias (legacy)', error);
}

// 2. raízes primeiro (FK parent_id + trigger de profundidade), depois subcategorias
for (const group of [
  catalog.categories.filter((c) => !c.parent_id),
  catalog.categories.filter((c) => c.parent_id),
]) {
  if (!group.length) continue;
  const { error } = await sb.from('categories').upsert(group.map(catRow), { onConflict: 'id' });
  if (error) die('categorias', error);
}
console.log('✓ categorias');

const catBySlug = new Map(catalog.categories.map((c) => [c.slug, c.id]));

const { error: prodErr } = await sb.from('products').upsert(
  catalog.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category_id: catBySlug.get(p.category_slug),
    barcode: p.barcode ?? null,
    short_description: p.short_description,
    description: p.description,
    ingredients: p.ingredients,
    how_to_use: p.how_to_use,
    price_cents: p.price_cents,
    compare_at_price_cents: p.compare_at_price_cents,
    stock: p.stock,
    is_active: p.is_active,
    is_bestseller: p.is_bestseller,
    rating: p.rating,
    reviews_count: p.reviews_count,
    images: p.images,
    attributes: p.attributes ?? {},
  })),
  { onConflict: 'slug' },
);
if (prodErr) {
  console.error('✗ produtos:', prodErr.message);
  process.exit(1);
}
console.log('✓ produtos');

// 3. remove as categorias antigas (agora sem produtos apontando para elas)
const { data: leftovers } = await sb.from('categories').select('id, slug').like('slug', '%__legacy');
for (const c of leftovers ?? []) {
  const { error } = await sb.from('categories').delete().eq('id', c.id);
  if (error) console.warn(`… não removeu ${c.slug}:`, error.message);
}
if ((leftovers ?? []).length) console.log(`✓ ${leftovers.length} categorias antigas removidas`);

// ofertas padrão do carrossel (só se a tabela existir e estiver vazia)
try {
  const rawOffers = await loadData('offers.default.json');
  // upsert em lote usa a união das colunas de todos os objetos; slide sem a
  // chave manda NULL explícito (em vez do default '' da coluna) — normaliza.
  const offers = rawOffers.map((o) => ({ ...o, image_url_mobile: o.image_url_mobile ?? '' }));
  const { count } = await sb.from('offers').select('id', { count: 'exact', head: true });
  if ((count ?? 0) === 0) {
    const { error } = await sb.from('offers').upsert(offers, { onConflict: 'id' });
    if (error) console.warn('… ofertas:', error.message, '(rode a migration 0005_offers.sql)');
    else console.log('✓ ofertas padrão');
  } else {
    console.log('… ofertas já existem, mantidas');
  }
} catch (e) {
  console.warn('… ofertas puladas:', e.message);
}

// conteúdo editável do site (só insere o que ainda não existe — não sobrescreve)
try {
  const siteContent = await loadData('site-content.default.json');
  const rows = Object.entries(siteContent).map(([section, v]) => ({
    section,
    is_active: v.is_active,
    data: v.data,
  }));
  const { error } = await sb
    .from('site_content')
    .upsert(rows, { onConflict: 'section', ignoreDuplicates: true });
  if (error) console.warn('… conteúdo do site:', error.message, '(rode a migration 0007_site_content.sql)');
  else console.log('✓ conteúdo do site (seções padrão)');
} catch (e) {
  console.warn('… conteúdo do site pulado:', e.message);
}

console.log('\nSeed concluído.');
