import { useState } from 'preact/hooks';
import { addToCart, openCart } from '../lib/cart';
import type { CartLine } from '../lib/types';

interface Props {
  product: Omit<CartLine, 'quantity'>;
  withQuantity?: boolean;
  label?: string;
}

export default function AddToCartButton({ product, withQuantity = false, label = 'Adicionar à sacola' }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    addToCart(product, qty);
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      {withQuantity && !soldOut && (
        <div class="inline-flex items-center rounded-card border border-ink/20">
          <button
            type="button"
            class="grid h-12 w-11 place-items-center text-lg text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Diminuir quantidade"
          >
            &minus;
          </button>
          <span class="w-8 text-center font-sans text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            class="grid h-12 w-11 place-items-center text-lg text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      )}
      <button
        type="button"
        class="btn-primary flex-1 disabled:cursor-not-allowed disabled:bg-ink/30"
        onClick={handleAdd}
        disabled={soldOut}
      >
        {soldOut ? 'Esgotado' : added ? 'Adicionado ✓' : label}
      </button>
    </div>
  );
}
