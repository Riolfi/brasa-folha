import type { APIRoute } from 'astro';
import { safeNextPath } from '../../../lib/auth';
import { claimGuestOrders } from '../../../lib/repo/orders';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const sb = locals.supabase;
  if (!sb) return redirect('/');

  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const next = safeNextPath(String(form.get('next') || ''), '/conta');

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect(`/entrar?erro=1&next=${encodeURIComponent(next)}`);
  }
  // vincula pedidos feitos como convidado antes de a conta existir
  if (data.user?.id && data.user.email) {
    await claimGuestOrders(data.user.email, data.user.id);
  }
  return redirect(next);
};
