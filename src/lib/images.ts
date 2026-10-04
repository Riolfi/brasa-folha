/**
 * Helper para as imagens de produto.
 *
 * Imagens do Unsplash (placeholders iniciais) ganham parâmetros de otimização
 * do próprio Unsplash. Imagens enviadas pelo admin (Supabase Storage ou
 * `/uploads/`) são servidas como estão.
 */

const FALLBACK = 'https://images.unsplash.com/photo-1521369909029-2afed882baee';

function isUnsplash(url: string): boolean {
  return /(^|\/\/)images\.unsplash\.com\//.test(url) || /(^|\/\/)plus\.unsplash\.com\//.test(url);
}

export function productImage(url: string | undefined, width = 900): string {
  const raw = url || FALLBACK;
  if (!isUnsplash(raw)) return raw;
  const base = raw.split('?')[0];
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(width), q: '70' });
  return `${base}?${params.toString()}`;
}

export function firstImage(images: string[] | undefined, width = 900): string {
  return productImage(images?.[0], width);
}
