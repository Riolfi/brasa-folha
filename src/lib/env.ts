/**
 * Leitura centralizada de variáveis de ambiente (server-side).
 * Usa import.meta.env (injetado pelo Vite/Astro) com fallback para process.env
 * (útil em runtimes serverless e scripts).
 */

function read(key: string): string {
  const fromVite = (import.meta.env as Record<string, string | undefined>)[key];
  if (fromVite != null && fromVite !== '') return fromVite;
  const fromNode = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  return fromNode ?? '';
}

export const env = {
  siteUrl: read('PUBLIC_SITE_URL') || 'http://localhost:4321',

  /** Nome da marca — usado em títulos, e-mails, fatura do cartão, JSON-LD. */
  brandName: read('PUBLIC_BRAND_NAME') || 'Brasa & Folha',
  /** Razão social + CNPJ para páginas legais e descrição de cobrança. */
  brandLegalName: read('PUBLIC_BRAND_LEGAL_NAME') || 'Brasa & Folha Comércio de Tabacaria LTDA',
  brandCnpj: read('PUBLIC_BRAND_CNPJ') || '00.000.000/0001-00',
  /** Liga/desliga o teste de pele (`/rotina`) e seus pontos de entrada. */
  quizEnabled: (read('PUBLIC_QUIZ_ENABLED') || 'false') !== 'false',

  supabaseUrl: read('SUPABASE_URL'),
  supabaseAnonKey: read('PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey: read('SUPABASE_SERVICE_ROLE_KEY'),

  mpPublicKey: read('PUBLIC_MP_PUBLIC_KEY'),
  mpAccessToken: read('MP_ACCESS_TOKEN'),
  mpWebhookSecret: read('MP_WEBHOOK_SECRET'),

  resendApiKey: read('RESEND_API_KEY'),
  resendFrom:
    read('RESEND_FROM') ||
    `${read('PUBLIC_BRAND_NAME') || 'Brasa & Folha'} <onboarding@resend.dev>`,

  adminPassword: read('ADMIN_PASSWORD'),
  adminSessionSecret: read('ADMIN_SESSION_SECRET') || 'insecure-dev-secret',

  whatsappNumber: read('PUBLIC_WHATSAPP_NUMBER') || '5511999999999',
  shippingFreeThresholdCents: Number(read('PUBLIC_SHIPPING_FREE_THRESHOLD_CENTS') || '19900'),
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const hasSupabasePublic = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasMercadoPago = Boolean(env.mpAccessToken && env.mpPublicKey);
export const hasResend = Boolean(env.resendApiKey);
