/** Garante que um `?next=` seja um caminho interno (evita open redirect). */
export function safeNextPath(next: string | null | undefined, fallback = '/conta'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}

/** Marca o destino pós-login com ?entrou=1 — o BaseLayout mostra o aviso
 *  "você entrou" e limpa o parâmetro da URL. */
export function withLoginFlag(dest: string): string {
  const [path, hash = ''] = dest.split('#');
  return `${path}${path.includes('?') ? '&' : '?'}entrou=1${hash ? `#${hash}` : ''}`;
}
