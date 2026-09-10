import { useStore } from '@nanostores/preact';
import { favoriteSlugs, removeFavorite } from '../lib/favorites';
import { addToCart, openCart } from '../lib/cart';
import { brl } from '../lib/format';
import { productImage } from '../lib/images';

export interface FavCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  image: string;
  stock: number;
}

export default function FavoritesGrid({ products }: { products: FavCard[] }) {
  const slugs = useStore(favoriteSlugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = slugs.map((s) => bySlug.get(s)).filter((p): p is FavCard => Boolean(p));

  if (items.length === 0) {
    return (
      <div class="mx-auto max-w-md py-10 text-center">
        <p class="prose-iarah mx-auto">
          Você ainda não salvou nenhum favorito. Toque no{' '}
          <span aria-hidden="true">♡</span> nos produtos para guardá-los aqui.
        </p>
        <a href="/loja" class="btn-primary mt-6">Ver produtos</a>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {items.map((p) => {
        const soldOut = p.stock <= 0;
        return (
          <div key={p.slug}>
            <div class="relative overflow-hidden rounded-card bg-bone-200">
              <a href={`/produto/${p.slug}`} class="group block">
                <img
                  src={productImage(p.image, 700)}
                  alt={p.name}
                  loading="lazy"
                  class="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                />
              </a>
              <button
                type="button"
                onClick={() => removeFavorite(p.slug)}
                aria-label="Remover dos favoritos"
                title="Remover dos favoritos"
                class="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-bone/90 text-ink shadow-sm backdrop-blur transition hover:bg-bone"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" class="text-agua-dark">
                  <path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.3 1.15 4 2.25.7-1.1 2-2.25 4-2.25 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20Z" />
                </svg>
              </button>
              {soldOut && (
                <span class="absolute left-3 top-3 rounded-card bg-ink/80 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.14em] text-bone">
                  Esgotado
                </span>
              )}
            </div>

            <div class="mt-4">
              <p class="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">{p.category}</p>
              <h3 class="mt-1 font-display text-lg leading-snug text-ink">
                <a href={`/produto/${p.slug}`} class="hover:text-agua-dark">{p.name}</a>
              </h3>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="font-display text-ink">{brl(p.priceCents)}</span>
                {p.compareAtCents != null && p.compareAtCents > p.priceCents && (
                  <span class="font-sans text-sm text-ink-muted line-through">{brl(p.compareAtCents)}</span>
                )}
              </div>
              <button
                type="button"
                class="btn-outline mt-3 w-full text-[13px] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={soldOut}
                onClick={() => {
                  addToCart(
                    {
                      productId: p.id,
                      slug: p.slug,
                      name: p.name,
                      priceCents: p.priceCents,
                      image: p.image,
                      stock: p.stock,
                    },
                    1,
                  );
                  openCart();
                }}
              >
                {soldOut ? 'Esgotado' : 'Adicionar à sacola'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
