import type { APIRoute } from 'astro';
import { getProductByBarcode } from '../../../../lib/repo/catalog';

/**
 * GET /api/admin/products/by-barcode?code=XXXX
 * Usado por:
 *  - atalho de leitor na lista de Produtos: achou → id pra editar; não achou
 *    → 404, a tela manda pro cadastro novo com o código preenchido;
 *  - Caixa (PDV): precisa também de preço, estoque e foto pra montar a linha.
 */
export const GET: APIRoute = async ({ url }) => {
  const code = (url.searchParams.get('code') || '').trim();
  if (!code) {
    return new Response(JSON.stringify({ error: 'code obrigatório.' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const product = await getProductByBarcode(code);
  if (!product) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(
    JSON.stringify({
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      stock: product.stock,
      is_active: product.is_active,
      image: product.images[0] ?? null,
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    },
  );
};
