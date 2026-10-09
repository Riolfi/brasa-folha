import type { APIRoute } from 'astro';
import { env } from '../../../lib/env';
import { safeNextPath } from '../../../lib/auth';

export const GET: APIRoute = async ({ locals, url, redirect }) => {
  const sb = locals.supabase;
  if (!sb) return redirect('/');

  const next = safeNextPath(url.searchParams.get('next'), '/');

  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    return redirect(`/entrar?erro=google&next=${encodeURIComponent(next)}`);
  }
  return redirect(data.url);
};
