import type { APIRoute } from 'astro';
import { env } from '../../../lib/env';
import { isValidEmail } from '../../../lib/format';
import { safeNextPath as safeNext } from '../../../lib/auth';
import { claimGuestOrders } from '../../../lib/repo/orders';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const sb = locals.supabase;
  if (!sb) return redirect('/');

  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const next = safeNext(String(form.get('next') || ''), '/conta');
  const q = `next=${encodeURIComponent(next)}`;

  if (name.length < 2 || !isValidEmail(email) || password.length < 8) {
    return redirect(`/cadastrar?erro=validacao&${q}`);
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${env.siteUrl}/auth/callback?${q}`,
    },
  });

  if (error) {
    return redirect(`/cadastrar?erro=1&${q}`);
  }
  // Confirmação de e-mail ativada => sem sessão ainda (o claim acontece no /auth/callback)
  if (!data.session) {
    return redirect(`/cadastrar?enviado=1&${q}`);
  }

  // Sessão imediata (confirmação desligada): vincula pedidos feitos como convidado
  if (data.user?.id) {
    await claimGuestOrders(email, data.user.id);
  }
  return redirect(next);
};
