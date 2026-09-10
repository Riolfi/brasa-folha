import type { APIRoute } from 'astro';
import { onlyDigits } from '../../../lib/format';
import { calcShipping } from '../../../lib/shipping';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export const GET: APIRoute = async ({ params, url }) => {
  const cep = onlyDigits(params.cep || '');
  if (cep.length !== 8) {
    return json({ error: 'CEP inválido.' }, 400);
  }

  const subtotal = Number(url.searchParams.get('subtotal') || '0');
  const shipping = calcShipping(cep, Number.isFinite(subtotal) ? subtotal : 0);

  let address: {
    street: string;
    district: string;
    city: string;
    state: string;
  } | null = null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = (await res.json()) as ViaCepResponse;
      if (!data.erro) {
        address = {
          street: data.logradouro || '',
          district: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        };
      }
    }
  } catch {
    // ViaCEP fora do ar — seguimos só com a cotação de frete
  }

  return json({ cep, address, shipping });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
