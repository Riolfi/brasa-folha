import { useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  cartLines,
  cartOpen,
  cartSubtotalCents,
  closeCart,
  removeFromCart,
  updateQuantity,
  FREE_SHIPPING_CENTS,
} from '../lib/cart';
import { brl } from '../lib/format';
import { productImage } from '../lib/images';

export default function CartDrawer() {
  const open = useStore(cartOpen);
  const lines = useStore(cartLines);
  const subtotal = useStore(cartSubtotalCents);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const remaining = Math.max(0, FREE_SHIPPING_CENTS - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_CENTS) * 100));

  return (
    <div
      class={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        class={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => closeCart()}
      />
      <aside
        class={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-bone shadow-xl transition-transform duration-[350ms] ease-smooth ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Sacola de compras"
      >
        <header class="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 class="font-display text-xl">Sua sacola</h2>
          <button
            type="button"
            onClick={() => closeCart()}
            class="text-sm uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
            aria-label="Fechar sacola"
          >
            Fechar
          </button>
        </header>

        {lines.length === 0 ? (
          <div class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p class="prose-iarah">Sua sacola está vazia.</p>
            <a href="/loja" class="btn-outline" onClick={() => closeCart()}>
              Ver a loja
            </a>
          </div>
        ) : (
          <>
            <div class="border-b border-ink/10 px-6 py-4">
              {remaining > 0 ? (
                <p class="font-sans text-[13px] text-ink-soft">
                  Faltam <strong class="text-ink">{brl(remaining)}</strong> para o frete grátis
                </p>
              ) : (
                <p class="font-sans text-[13px] font-medium text-agua-dark">
                  Você ganhou frete grátis ✓
                </p>
              )}
              <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  class="h-full rounded-full bg-agua transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <ul class="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.productId} class="flex gap-4 py-5">
                  <a
                    href={`/produto/${line.slug}`}
                    onClick={() => closeCart()}
                    class="h-20 w-16 shrink-0 overflow-hidden rounded-card bg-bone-200"
                  >
                    <img
                      src={productImage(line.image, 200)}
                      alt={line.name}
                      class="h-full w-full object-cover"
                      loading="lazy"
                      width={64}
                      height={80}
                    />
                  </a>
                  <div class="flex flex-1 flex-col">
                    <a
                      href={`/produto/${line.slug}`}
                      onClick={() => closeCart()}
                      class="font-sans text-sm leading-snug text-ink hover:text-agua-dark"
                    >
                      {line.name}
                    </a>
                    <span class="mt-0.5 font-sans text-[13px] text-ink-muted">
                      {brl(line.priceCents)}
                    </span>
                    <div class="mt-auto flex items-center justify-between pt-2">
                      <div class="inline-flex items-center rounded-card border border-ink/20">
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center text-ink-soft hover:text-ink disabled:opacity-30"
                          onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          aria-label="Diminuir"
                        >
                          &minus;
                        </button>
                        <span class="w-7 text-center font-sans text-[13px] tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          class="grid h-8 w-8 place-items-center text-ink-soft hover:text-ink disabled:opacity-30"
                          onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                          disabled={line.quantity >= line.stock}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        class="font-sans text-[12px] uppercase tracking-[0.12em] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                        onClick={() => removeFromCart(line.productId)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer class="border-t border-ink/10 px-6 py-5">
              <div class="flex items-center justify-between font-sans text-sm">
                <span class="text-ink-soft">Subtotal</span>
                <span class="font-display text-lg text-ink">{brl(subtotal)}</span>
              </div>
              <p class="mt-1 font-sans text-[12px] text-ink-muted">
                Frete e impostos calculados no checkout.
              </p>
              <a href="/checkout" class="btn-primary mt-4 w-full" onClick={() => closeCart()}>
                Finalizar compra
              </a>
              <button
                type="button"
                class="mt-2 w-full text-center font-sans text-[12px] uppercase tracking-[0.12em] text-ink-muted hover:text-ink"
                onClick={() => closeCart()}
              >
                Continuar comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
