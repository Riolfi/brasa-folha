import type { APIRoute } from 'astro';
import { uploadImage, isAllowedFolder } from '../../../lib/storage';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return json({ error: 'Envio inválido.' }, 400);

  const folderRaw = String(form.get('folder') || 'products');
  const folder = isAllowedFolder(folderRaw) ? folderRaw : 'products';
  const kind = String(form.get('kind') || '');

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return json({ error: 'Nenhum arquivo enviado.' }, 400);
  if (files.length > 6) return json({ error: 'Máximo de 6 imagens por vez.' }, 422);

  // Logotipo: só PNG/WebP (fundo transparente) e no máximo 1 MB.
  const opts =
    kind === 'logo'
      ? { maxBytes: 1024 * 1024, allowedTypes: ['image/png', 'image/webp'] }
      : {};

  const urls: string[] = [];
  for (const file of files) {
    const res = await uploadImage(file, folder, opts);
    if ('error' in res) return json({ error: res.error }, 422);
    urls.push(res.url);
  }

  return json({ urls });
};
