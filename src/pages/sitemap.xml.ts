import type { APIRoute } from 'astro';
import { env } from '../lib/env';
import { getProducts, getCategories } from '../lib/repo/catalog';

export const prerender = false;

export const GET: APIRoute = async () => {
  const base = env.siteUrl.replace(/\/$/, '');
  const [products, categories] = await Promise.all([getProducts({}), getCategories()]);

  const staticPaths = [
    '/',
    '/loja',
    '/sobre',
    '/contato',
    '/politica-trocas',
    '/termos',
    '/privacidade',
  ];

  const urls = [
    ...staticPaths.map((p) => ({ loc: `${base}${p}`, priority: p === '/' ? '1.0' : '0.6' })),
    ...categories.map((c) => ({ loc: `${base}/loja?categoria=${c.slug}`, priority: '0.7' })),
    ...products.map((p) => ({ loc: `${base}/produto/${p.slug}`, priority: '0.8' })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
