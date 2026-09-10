import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { CartLine } from './types';

/** Linhas do carrinho, persistidas em localStorage. */
export const cartLines = persistentAtom<CartLine[]>('iarah:cart:v1', [], {
  encode: JSON.stringify,
  decode: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
    } catch {
      return [];
    }
  },
});

/** Estado de abertura do drawer do carrinho. */
export const cartOpen = atom(false);

export const FREE_SHIPPING_CENTS = Number(
  import.meta.env.PUBLIC_SHIPPING_FREE_THRESHOLD_CENTS || '19900',
);

export const cartCount = computed(cartLines, (lines) =>
  lines.reduce((total, line) => total + line.quantity, 0),
);

export const cartSubtotalCents = computed(cartLines, (lines) =>
  lines.reduce((total, line) => total + line.priceCents * line.quantity, 0),
);

function clampQty(qty: number, stock: number): number {
  const max = Number.isFinite(stock) && stock > 0 ? stock : 99;
  return Math.max(1, Math.min(qty, max));
}

export function addToCart(line: Omit<CartLine, 'quantity'>, qty = 1): void {
  const lines = [...cartLines.get()];
  const existing = lines.find((l) => l.productId === line.productId);
  if (existing) {
    existing.quantity = clampQty(existing.quantity + qty, line.stock);
  } else {
    lines.push({ ...line, quantity: clampQty(qty, line.stock) });
  }
  cartLines.set(lines);
}

export function updateQuantity(productId: string, qty: number): void {
  const lines = cartLines
    .get()
    .map((l) => (l.productId === productId ? { ...l, quantity: clampQty(qty, l.stock) } : l));
  cartLines.set(lines);
}

export function removeFromCart(productId: string): void {
  cartLines.set(cartLines.get().filter((l) => l.productId !== productId));
}

export function clearCart(): void {
  cartLines.set([]);
}

export function openCart(): void {
  cartOpen.set(true);
}

export function closeCart(): void {
  cartOpen.set(false);
}
