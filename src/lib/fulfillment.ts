import { confirmOrderPayment } from './repo/orders';
import { sendOrderConfirmation } from './email';
import type { PaymentMethod } from './types';

/**
 * Pipeline único de "pedido pago": decrementa estoque (atômico/idempotente) e
 * envia o e-mail de confirmação apenas na transição pending -> paid.
 * Chamado tanto pelo /api/payments quanto pelo webhook do Mercado Pago.
 */
export async function fulfillPaidOrder(
  orderNumber: string,
  opts: { paymentId: string | null; method: PaymentMethod },
) {
  const { order, outcome } = await confirmOrderPayment(orderNumber, opts);

  if (outcome === 'confirmed' && order) {
    try {
      await sendOrderConfirmation(order);
    } catch (err) {
      console.error(`[fulfillment] falha ao enviar e-mail do pedido ${orderNumber}:`, err);
    }
  }

  return { order, outcome };
}
