/** Formata centavos (int) como moeda brasileira: 6990 -> "R$ 69,90". */
export function brl(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Apenas o número, sem símbolo: 6990 -> "69,90". */
export function brlNumber(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Parcelamento simples sem juros até 6x (mínimo de R$ 20 por parcela). */
export function installments(
  totalCents: number,
  maxInstallments = 6,
  minPerCents = 2000,
): { count: number; perCents: number } {
  let count = maxInstallments;
  while (count > 1 && totalCents / count < minPerCents) count--;
  return { count, perCents: Math.round(totalCents / count) };
}

/** Slug seguro a partir de um texto livre. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/** Máscara de CEP: "01310100" -> "01310-100". Retorna só dígitos se incompleto. */
export function formatCep(cep: string): string {
  const digits = onlyDigits(cep).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Máscara de CPF progressiva: "39053344705" -> "390.533.447-05". */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Máscara de telefone BR: "(11) 91234-5678" (celular) ou "(11) 1234-5678" (fixo). */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 10 || d.length === 11;
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

/** Gera um número de pedido curto e legível: IAR-20260829-8F3A2. */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `IAR-${date}-${rand}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validação de CPF (formato + dígitos verificadores). */
export function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]!, 10) * (len + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(9) === parseInt(d[9]!, 10) && calc(10) === parseInt(d[10]!, 10);
}
