import type { APIRoute } from 'astro';
import { deleteAddress, saveAddress, type AddressInput } from '../../../lib/repo/account';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function parse(raw: Record<string, unknown>): AddressInput | null {
  const street = String(raw.street || '').trim();
  const number = String(raw.number || '').trim();
  const city = String(raw.city || '').trim();
  const state = String(raw.state || '').trim();
  const cep = String(raw.cep || '').trim();
  if (!street || !number || !city || !state || !cep) return null;
  return {
    id: raw.id ? String(raw.id) : undefined,
    label: String(raw.label || 'Endereço'),
    cep,
    street,
    number,
    complement: String(raw.complement || ''),
    district: String(raw.district || ''),
    city,
    state,
    is_default: raw.is_default === true || raw.is_default === 'on',
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const sb = locals.supabase;
  const user = locals.user;
  if (!sb || !user) return json({ error: 'Não autenticado.' }, 401);

  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return json({ error: 'JSON inválido.' }, 400);
  const input = parse(raw);
  if (!input) return json({ error: 'Preencha CEP, rua, número, cidade e estado.' }, 422);

  const result = await saveAddress(sb, user.id, input);
  if (!result.ok) return json({ error: result.error }, 500);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals, url }) => {
  const sb = locals.supabase;
  const user = locals.user;
  if (!sb || !user) return json({ error: 'Não autenticado.' }, 401);

  const id = url.searchParams.get('id') || (await request.json().catch(() => ({})))?.id;
  if (!id) return json({ error: 'id obrigatório.' }, 400);
  const result = await deleteAddress(sb, String(id));
  return result.ok ? json({ ok: true }) : json({ error: 'Erro ao excluir.' }, 500);
};
