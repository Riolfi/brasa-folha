import { useStore } from '@nanostores/preact';
import { cartCount, openCart } from '../lib/cart';

export default function CartButton() {
  const count = useStore(cartCount);
  return (
    <button
      type="button"
      onClick={() => openCart()}
      class="relative inline-flex items-center gap-2 font-sans text-[13px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-agua-dark"
      aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
    >
      <span class="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/20">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          hidden={count === 0}
          class="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-agua px-1 text-[10px] font-semibold leading-none text-white"
        >
          {count}
        </span>
      </span>
    </button>
  );
}
