import { useStore } from '@nanostores/preact';
import { favoriteCount } from '../lib/favorites';

export default function FavoritesLink() {
  const count = useStore(favoriteCount);
  return (
    <a
      href="/favoritos"
      class="relative inline-flex items-center gap-2 font-sans text-[13px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-agua-dark"
      aria-label={`Favoritos, ${count} ${count === 1 ? 'item' : 'itens'}`}
    >
      <span class="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/20">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.3 1.15 4 2.25.7-1.1 2-2.25 4-2.25 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20Z" />
        </svg>
        <span
          hidden={count === 0}
          class="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-agua px-1 text-[10px] font-semibold leading-none text-white"
        >
          {count}
        </span>
      </span>
    </a>
  );
}
