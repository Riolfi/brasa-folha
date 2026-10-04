import type { APIRoute } from 'astro';
import {
  getSiteSection,
  isSiteSectionKey,
  resetSiteSection,
  saveSiteSection,
} from '../../../lib/repo/site';
import { DEFAULT_SITE_CONTENT } from '../../../lib/site-defaults';
import type { SiteSectionData, SiteSectionKey } from '../../../lib/types';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const digits = (v: unknown): string => (typeof v === 'string' ? v.replace(/\D/g, '') : '');

/* eslint-disable @typescript-eslint/no-explicit-any */
function sanitize<K extends SiteSectionKey>(key: K, raw: any): SiteSectionData[K] {
  const d = raw && typeof raw === 'object' ? raw : {};
  const fallback = DEFAULT_SITE_CONTENT[key].data as any;

  switch (key) {
    case 'brand':
      return { logo_url: str(d.logo_url) } as SiteSectionData[K];
    case 'home_bestsellers':
      return {
        eyebrow: str(d.eyebrow),
        title: str(d.title),
        cta_label: str(d.cta_label),
        cta_href: str(d.cta_href) || '/loja',
      } as SiteSectionData[K];
    case 'home_story':
      return {
        eyebrow: str(d.eyebrow),
        title: str(d.title),
        body: str(d.body),
        cta_label: str(d.cta_label),
        cta_href: str(d.cta_href) || '/sobre',
        features: (Array.isArray(d.features) ? d.features : [])
          .map((v: any) => ({ title: str(v?.title), body: str(v?.body) }))
          .filter((v: { title: string; body: string }) => v.title || v.body)
          .slice(0, 8),
      } as SiteSectionData[K];
    case 'home_social':
      return {
        eyebrow: str(d.eyebrow),
        title: str(d.title),
        subtitle: str(d.subtitle),
        testimonials: (Array.isArray(d.testimonials) ? d.testimonials : [])
          .map((v: any) => ({ quote: str(v?.quote), name: str(v?.name), detail: str(v?.detail) }))
          .filter((v: { quote: string; name: string }) => v.quote || v.name)
          .slice(0, 12),
      } as SiteSectionData[K];
    case 'footer':
      return {
        tagline: str(d.tagline),
        returns_line: str(d.returns_line),
        legal_line: str(d.legal_line),
        payment_line: str(d.payment_line),
      } as SiteSectionData[K];
    case 'contact':
      return {
        email: str(d.email),
        whatsapp_number: digits(d.whatsapp_number),
        hours: str(d.hours),
      } as SiteSectionData[K];
    case 'page_sobre':
      return {
        hero_eyebrow: str(d.hero_eyebrow),
        hero_title: str(d.hero_title),
        paragraphs: (Array.isArray(d.paragraphs) ? d.paragraphs : [])
          .map(str)
          .filter(Boolean)
          .slice(0, 12),
        values: (Array.isArray(d.values) ? d.values : [])
          .map((v: any) => ({ title: str(v?.title), body: str(v?.body) }))
          .filter((v: { title: string; body: string }) => v.title || v.body)
          .slice(0, 8),
        cta_title: str(d.cta_title),
        cta_body: str(d.cta_body),
        cta_label: str(d.cta_label),
        cta_href: str(d.cta_href) || '/loja',
      } as SiteSectionData[K];
    case 'page_contato':
      return {
        eyebrow: str(d.eyebrow),
        title: str(d.title),
        intro: str(d.intro),
        show_form: d.show_form !== false,
      } as SiteSectionData[K];
    default:
      return fallback as SiteSectionData[K];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const POST: APIRoute = async ({ request, url }) => {
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return json({ error: 'JSON inválido.' }, 400);

  const section = String(raw.section || '');
  if (!isSiteSectionKey(section)) return json({ error: 'Seção desconhecida.' }, 422);

  if (url.searchParams.get('action') === 'reset') {
    const result = await resetSiteSection(section);
    return result.ok ? json({ ok: true }) : json({ error: result.error }, 500);
  }

  const current = await getSiteSection(section);
  const is_active =
    typeof raw.is_active === 'boolean' ? raw.is_active : current.is_active;
  const data = sanitize(section, raw.data);

  const result = await saveSiteSection(section, { is_active, data });
  return result.ok ? json({ ok: true }) : json({ error: result.error }, 500);
};
