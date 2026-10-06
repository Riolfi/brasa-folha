import { defineMiddleware } from 'astro:middleware';
import { ADMIN_COOKIE, verifySessionToken } from './lib/auth';
import { getServerClient } from './lib/supabase-server';
import { env, hasSupabasePublic } from './lib/env';
import { getSiteContent } from './lib/repo/site';
import { DEFAULT_SITE_CONTENT } from './lib/site-defaults';
import { checkStoreIdentity } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Banco de outra loja → não lê nem grava nada.
  const identityError = await checkStoreIdentity();
  if (identityError) {
    console.error('[store-identity]', identityError);
    // motivo no header (sem segredos) para diagnosticar sem acesso aos logs
    return new Response('Loja temporariamente indisponível.', {
      status: 503,
      headers: { 'x-store-identity': encodeURIComponent(identityError).slice(0, 300) },
    });
  }

  // -------------------------------------------------------------------------
  // Sessão do cliente (Supabase Auth) — só quando o Supabase está configurado
  // -------------------------------------------------------------------------
  context.locals.user = null;
  context.locals.supabase = null;

  context.locals.brand = { name: env.brandName };
  context.locals.accent = null;

  // Conteúdo editável do site — uma leitura por request, compartilhada por
  // página + Header/Footer/BaseLayout. Rotas de API não usam.
  context.locals.site = DEFAULT_SITE_CONTENT;
  if (!pathname.startsWith('/api/')) {
    context.locals.site = await getSiteContent();
  }

  const accountArea =
    pathname === '/conta' ||
    pathname.startsWith('/conta/') ||
    pathname.startsWith('/api/account');
  const authArea =
    pathname === '/entrar' || pathname === '/cadastrar' || pathname.startsWith('/auth/');

  if (hasSupabasePublic) {
    const supabase = getServerClient(context.request, context.cookies);
    context.locals.supabase = supabase;
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      context.locals.user = user;
    }

    if (accountArea && !context.locals.user) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      const next = encodeURIComponent(pathname + context.url.search);
      return context.redirect(`/entrar?next=${next}`);
    }
  } else if (accountArea || authArea) {
    // Modo fallback: contas de cliente desligadas
    return context.redirect('/');
  }

  // -------------------------------------------------------------------------
  // Área administrativa (senha única — independente do Supabase Auth)
  // -------------------------------------------------------------------------
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginRoute = pathname === '/admin/login' || pathname === '/api/admin/login';

  if (isAdminArea && !isLoginRoute) {
    const token = context.cookies.get(ADMIN_COOKIE)?.value;
    const authenticated = await verifySessionToken(token);
    if (!authenticated) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }
  }

  return next();
});
