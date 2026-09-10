import type { APIRoute } from 'astro';
import { getOrderByNumber } from '../../../lib/repo/orders';

export const GET: APIRoute = async ({ url }) => {
  const orderNumber = url.searchParams.get('n') || '';
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(
    JSON.stringify({
      status: order.status,
      redirect: order.status === 'paid' ? `/pedido/confirmado?n=${order.order_number}` : null,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
};
