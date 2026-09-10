import type { APIRoute } from 'astro';
import { env } from '../../../lib/env';
import { getPaymentStatus } from '../../../lib/mercadopago';
import { fulfillPaidOrder } from '../../../lib/fulfillment';
import { setOrderStatus } from '../../../lib/repo/orders';
import { sendOrderStatusEmail } from '../../../lib/email';

/**
 * Webhook do Mercado Pago (notificações de pagamento).
 * Configure a URL `<site>/api/webhooks/mercadopago` no painel de Webhooks
 * e cole a "assinatura secreta" em MP_WEBHOOK_SECRET.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const rawBody = await request.text();
  let payload: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    /* alguns testes enviam corpo vazio */
  }

  const dataId = payload.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');

  // ---- validação de assinatura (quando configurada) ----
  if (env.mpWebhookSecret) {
    const valid = await verifySignature(request, url, env.mpWebhookSecret);
    if (!valid) return new Response('assinatura inválida', { status: 401 });
  }

  const topic = payload.type || url.searchParams.get('type') || url.searchParams.get('topic');
  if (topic && topic !== 'payment') {
    return new Response('ignorado', { status: 200 });
  }
  if (!dataId) return new Response('sem id', { status: 200 });

  try {
    const info = await getPaymentStatus(String(dataId));
    if (!info || !info.externalReference) {
      return new Response('pagamento não encontrado', { status: 200 });
    }

    if (info.status === 'approved') {
      await fulfillPaidOrder(info.externalReference, {
        paymentId: String(dataId),
        method: 'pix',
      });
    } else if (info.status === 'rejected' || info.status === 'cancelled') {
      const order = await setOrderStatus(info.externalReference, 'failed');
      if (order) await sendOrderStatusEmail(order, 'failed').catch(() => {});
    }
    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('[webhook/mercadopago] erro:', err);
    // 200 para o MP não ficar reenviando indefinidamente por erro nosso
    return new Response('erro tratado', { status: 200 });
  }
};

async function verifySignature(request: Request, url: URL, secret: string): Promise<boolean> {
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(
    signature.split(',').map((kv) => kv.split('=').map((s) => s.trim())),
  ) as { ts?: string; v1?: string };
  if (!parts.ts || !parts.v1) return false;

  const dataId = (url.searchParams.get('data.id') || url.searchParams.get('id') || '').toLowerCase();
  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === parts.v1;
}
