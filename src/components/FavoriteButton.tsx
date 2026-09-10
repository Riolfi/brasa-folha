import { useStore } from '@nanostores/preact';
import { useRef, useState } from 'preact/hooks';
import { favoriteSlugs, toggleFavorite } from '../lib/favorites';

interface Props {
  slug: string;
  /** `floating` = botão sobre a imagem do card; senão, botão de linha ao lado de "adicionar". */
  floating?: boolean;
}

export default function FavoriteButton({ slug, floating = false }: Props) {
  const slugs = useStore(favoriteSlugs);
  const active = slugs.includes(slug);
  // Muda a cada vez que o produto passa a favoritado — força o remount da
  // camada de efeito, reiniciando a animação de forma limpa.
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      title={active ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowActive = toggleFavorite(slug);
        window.clearTimeout(timer.current);
        if (nowActive) {
          setBurst((n) => n + 1);
          timer.current = window.setTimeout(() => setBurst(0), 700);
        } else {
          setBurst(0);
        }
      }}
      class={
        floating
          ? 'fav-btn absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-bone/90 text-ink shadow-sm backdrop-blur transition hover:bg-bone'
          : 'fav-btn inline-grid h-12 w-12 shrink-0 place-items-center rounded-card border border-ink/20 text-ink transition hover:border-ink'
      }
    >
      <span key={burst} class={`fav-btn__inner ${burst ? 'is-burst' : ''}`}>
        <span class="fav-btn__ring" aria-hidden="true" />
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n} class="fav-btn__spark" style={`--a:${n * 60}deg`} aria-hidden="true" />
        ))}
        <svg
          class={`fav-btn__heart ${active ? 'text-agua-dark' : ''}`}
          width={floating ? 17 : 19}
          height={floating ? 17 : 19}
          viewBox="0 0 24 24"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        >
          <path d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.3 1.15 4 2.25.7-1.1 2-2.25 4-2.25 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20Z" />
        </svg>
      </span>
    </button>
  );
}
