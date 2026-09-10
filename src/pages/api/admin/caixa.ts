import type { APIRoute } from 'astro';
import { createCaixaSale, cancelCaixaSale } from '../../../lib/repo/orders';
import type { PaymentMethod } from '../../../lib/types';

/**
 * POST /api/admin/caixa
 *  - { items: [{ product_id, quantity }], method }  → finaliza a venda
 *  - { action: 'cancel', order_number }             → cancela e devolve estoque
 *
 * Protegido pelo middleware (/api/admin exige sessão de admin).
 */

const METHODS: PaymentMethod[] = ['cash', 'pix', 'debit_card', 'credit_card'];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Corpo inválido.' }, 400);
  }

  // --- cancelar venda ---
  if (body.action === 'cancel') {
    const orderNumber = String(body.order_number || '').trim();
    if (!orderNumber) return json({ error: 'Pedido não informado.' }, 400);
    try {
      const outcome = await cancelCaixaSale(orderNumber);
      if (outcome === 'not_found') return json({ error: 'Venda não encontrada.' }, 404);
      if (outcome === 'not_caixa') return json({ error: 'Esse pedido não é do Caixa.' }, 400);
      return json({ ok: true, outcome });
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'Falha ao cancelar.' }, 500);
    }
  }

  // --- finalizar venda ---
  const method = String(body.method || '') as PaymentMethod;
  if (!METHODS.includes(method)) return json({ error: 'Forma de pagamento inválida.' }, 400);

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map((i) => {
      const it = i as Record<string, unknown>;
      return { product_id: String(it.product_id || ''), quantity: Number(it.quantity) || 0 };
    })
    .filter((i) => i.product_id && i.quantity > 0);
  if (!items.length) return json({ error: 'Adicione ao menos um item.' }, 400);

  try {
    const order = await createCaixaSale({ items, method });
    return json({
      ok: true,
      order_number: order.order_number,
      total_cents: order.total_cents,
      items: order.items.map((i) => ({
        name: i.product_name,
        quantity: i.quantity,
        unit_price_cents: i.unit_price_cents,
      })),
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Falha ao registrar a venda.' }, 500);
  }
};
