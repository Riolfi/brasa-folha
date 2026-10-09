/** Garante que um `?next=` seja um caminho interno (evita open redirect). */
export function safeNextPath(next: string | null | undefined, fallback = '/conta'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}
