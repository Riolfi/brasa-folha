import { env } from './env';
import { onlyDigits } from './format';

export interface ShippingQuote {
  cents: number;
  label: string;
  etaDays: [number, number];
  free: boolean;
}

/**
 * Frete simplificado (sem integração de transportadora):
 *  - grátis acima do limite configurável (padrão R$ 199)
 *  - senão, valor fixo por região a partir do primeiro dígito do CEP
 */
const REGIONS: Record<string, { cents: number; label: string; eta: [number, number] }> = {
  // Sudeste (SP, RJ, ES, MG)
  '0': { cents: 1490, label: 'Sudeste', eta: [2, 5] },
  '1': { cents: 1490, label: 'Sudeste', eta: [2, 5] },
  '2': { cents: 1690, label: 'Sudeste', eta: [3, 6] },
  '3': { cents: 1690, label: 'Sudeste', eta: [3, 6] },
  // Sul (PR, SC, RS)
  '8': { cents: 1990, label: 'Sul', eta: [4, 8] },
  '9': { cents: 1990, label: 'Sul', eta: [4, 8] },
  // Centro-Oeste (GO, DF, MT, MS) + Tocantins
  '7': { cents: 1990, label: 'Centro-Oeste', eta: [5, 9] },
  // Nordeste (BA, SE, AL, PE, PB, RN, CE, PI, MA)
  '4': { cents: 2490, label: 'Nordeste', eta: [6, 11] },
  '5': { cents: 2490, label: 'Nordeste', eta: [6, 11] },
  '6': { cents: 2490, label: 'Norte / Nordeste', eta: [7, 14] },
};

export function calcShipping(cep: string, subtotalCents: number): ShippingQuote | null {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  const threshold = env.shippingFreeThresholdCents;
  if (subtotalCents >= threshold) {
    return { cents: 0, label: 'Frete grátis', etaDays: [3, 8], free: true };
  }

  const region = REGIONS[digits[0]!] ?? { cents: 2490, label: 'Brasil', eta: [7, 14] };
  return {
    cents: region.cents,
    label: `Entrega — ${region.label}`,
    etaDays: region.eta,
    free: false,
  };
}

export function shippingProgress(subtotalCents: number): { remainingCents: number; pct: number; threshold: number } {
  const threshold = env.shippingFreeThresholdCents;
  const remainingCents = Math.max(0, threshold - subtotalCents);
  const pct = Math.min(100, Math.round((subtotalCents / threshold) * 100));
  return { remainingCents, pct, threshold };
}
