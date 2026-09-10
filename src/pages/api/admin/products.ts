import type { APIRoute } from 'astro';
import {
  saveProduct,
  deleteProduct,
  normalizeAttributes,
  getSubcategories,
  type ProductInput,
} from '../../../lib/repo/catalog';
import { slugify } from '../../../lib/format';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parseInput(raw: Record<string, unknown>): { ok: true; value: ProductInput } | { ok: false; error: string } {
  const name = String(raw.name || '').trim();
  const category_id = String(raw.category_id || '').trim();
  if (name.length < 2) return { ok: false, error: 'Nome obrigatório.' };
  if (!category_id) return { ok: false, error: 'Categoria obrigatória.' };

  const price_cents = Math.round(Number(raw.price_cents) || 0);
  if (price_cents <= 0) return { ok: false, error: 'Preço inválido.' };

  const compareRaw = Number(raw.compare_at_price_cents);
  const compare_at_price_cents = Number.isFinite(compareRaw) && compareRaw > 0 ? Math.round(compareRaw) : null;

  const images = Array.isArray(raw.images)
    ? raw.images.map((s) => String(s).trim()).filter(Boolean)
    : String(raw.images || '')
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);

  return {
    ok: true,
    value: {
      id: raw.id ? String(raw.id) : undefined,
      slug: String(raw.slug || '').trim() || slugify(name),
      name,
      category_id,
      short_description: String(raw.short_description || '').trim(),
      description: String(raw.description || '').trim(),
      ingredients: String(raw.ingredients || '').trim(),
      how_to_use: String(raw.how_to_use || '').trim(),
      price_cents,
      compare_at_price_cents,
      stock: Math.max(0, Math.round(Number(raw.stock) || 0)),
      barcode: String(raw.barcode || '').trim() || null,
      is_active: raw.is_active === true || raw.is_active === 'on' || raw.is_active === 'true',
      is_bestseller: raw.is_bestseller === true || raw.is_bestseller === 'on' || raw.is_bestseller === 'true',
      images,
      attributes: normalizeAttributes(raw.attributes),
    },
  };
}

export const POST: APIRoute = async ({ request }) => {
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return json({ error: 'JSON inválido.' }, 400);

  const parsed = parseInput(raw);
  if (!parsed.ok) return json({ error: parsed.error }, 422);

  const subs = await getSubcategories();
  if (!subs.some((s) => s.id === parsed.value.category_id)) {
    return json({ error: 'O produto deve pertencer a uma subcategoria (nível 2).' }, 422);
  }

  const result = await saveProduct(parsed.value);
  if (!result.ok) return json({ error: result.error }, 500);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const id = url.searchParams.get('id') || (await request.json().catch(() => ({})))?.id;
  if (!id) return json({ error: 'id obrigatório.' }, 400);
  const result = await deleteProduct(String(id));
  if (!result.ok) return json({ error: result.error }, 500);
  return json({ ok: true });
};
