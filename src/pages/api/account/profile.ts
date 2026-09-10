import type { APIRoute } from 'astro';
import { upsertProfile } from '../../../lib/repo/account';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const sb = locals.supabase;
  const user = locals.user;
  if (!sb || !user) return json({ error: 'Não autenticado.' }, 401);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: 'JSON inválido.' }, 400);

  const result = await upsertProfile(sb, user.id, {
    full_name: String(body.full_name || ''),
    phone: String(body.phone || ''),
    cpf: String(body.cpf || ''),
  });
  if (!result.ok) return json({ error: result.error }, 500);
  return json({ ok: true });
};
