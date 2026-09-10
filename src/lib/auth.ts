import { env } from './env';

export const ADMIN_COOKIE = 'bf_admin';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function b64url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.adminSessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return b64url(sig);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Confere a senha do admin (comparação de tempo constante básica). */
export function checkPassword(input: string): boolean {
  if (!env.adminPassword) return false;
  return safeEqual(String(input || ''), env.adminPassword);
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [role, ts, sig] = parts;
  const expected = await sign(`${role}.${ts}`);
  if (!safeEqual(sig!, expected)) return false;
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS;
}

/** Garante que um `?next=` seja um caminho interno (evita open redirect). */
export function safeNextPath(next: string | null | undefined, fallback = '/conta'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: Math.floor(MAX_AGE_MS / 1000),
  };
}
