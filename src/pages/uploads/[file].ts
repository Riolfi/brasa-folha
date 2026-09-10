import type { APIRoute } from 'astro';
import { readLocalUpload } from '../../lib/storage';

export const prerender = false;

/** Serve imagens do modo fallback (.data/uploads). Em produção use Supabase Storage. */
export const GET: APIRoute = async ({ params }) => {
  const found = params.file ? await readLocalUpload(params.file) : null;
  if (!found) return new Response('Not found', { status: 404 });
  return new Response(found.body as unknown as ArrayBuffer, {
    headers: {
      'content-type': found.type,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};
