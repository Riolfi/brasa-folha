import { createServerClient, parseCookieHeader, type CookieOptionsWithName } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { env, hasSupabasePublic } from './env';

const COOKIE_OPTIONS: CookieOptionsWithName = {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  secure: env.siteUrl.startsWith('https://'),
};

/**
 * Client Supabase escopado à sessão do usuário (lê do header Cookie da
 * requisição, grava via Astro.cookies). A autorização é feita pelo RLS — este
 * client NÃO ignora RLS. Retorna null no modo fallback (sem Supabase).
 */
export function getServerClient(
  request: Request,
  cookies: AstroCookies,
): SupabaseClient | null {
  if (!hasSupabasePublic) return null;

  const header = request.headers.get('Cookie') ?? '';

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return parseCookieHeader(header).map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, { ...COOKIE_OPTIONS, ...options });
        }
      },
    },
  });
}
