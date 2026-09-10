import type { APIRoute } from 'astro';
import { ADMIN_COOKIE, checkPassword, createSessionToken, sessionCookieOptions } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, url, redirect }) => {
  const form = await request.formData();
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '/admin');

  if (!checkPassword(password)) {
    return redirect('/admin/login?erro=1');
  }

  const token = await createSessionToken();
  cookies.set(ADMIN_COOKIE, token, sessionCookieOptions(url.protocol === 'https:'));
  return redirect(next.startsWith('/admin') ? next : '/admin');
};
