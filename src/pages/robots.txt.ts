import type { APIRoute } from 'astro';
import { env } from '../lib/env';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /pedido/
Disallow: /api/

Sitemap: ${env.siteUrl}/sitemap.xml
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
