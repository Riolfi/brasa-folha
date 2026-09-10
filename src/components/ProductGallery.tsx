import { useState } from 'preact/hooks';

interface Props {
  images: string[];
  name: string;
}

function withParams(url: string, w: number): string {
  if (!/unsplash\.com\//.test(url || '')) return url || '';
  return `${(url || '').split('?')[0]}?auto=format&fit=crop&q=70&w=${w}`;
}

export default function ProductGallery({ images, name }: Props) {
  const pics = images.length ? images : [''];
  const [active, setActive] = useState(0);
  const multiple = pics.length > 1;

  function next() {
    setActive((i) => (i + 1) % pics.length);
  }

  return (
    <div class="flex flex-col-reverse gap-4 sm:flex-row">
      {multiple && (
        <div class="flex gap-3 sm:flex-col">
          {pics.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              class={`h-16 w-14 shrink-0 overflow-hidden rounded-card border-2 transition-colors sm:h-20 sm:w-16 ${
                i === active ? 'border-ink' : 'border-transparent hover:border-ink/30'
              }`}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === active}
            >
              <img
                src={withParams(img, 160)}
                alt=""
                class="h-full w-full object-cover"
                loading="lazy"
                width={64}
                height={80}
              />
            </button>
          ))}
        </div>
      )}

      <div class="relative flex-1 overflow-hidden rounded-card bg-bone-200">
        <img
          src={withParams(pics[active] ?? '', 1000)}
          alt={`${name} — imagem ${active + 1}`}
          class={`h-full w-full object-cover ${multiple ? 'cursor-pointer' : ''}`}
          style={{ aspectRatio: '4 / 5' }}
          width={800}
          height={1000}
          fetchPriority="high"
          onClick={multiple ? next : undefined}
        />

        {multiple && (
          <>
            <div class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {pics.map((_, i) => (
                <span
                  key={i}
                  class={`h-1.5 rounded-full transition-all ${
                    i === active ? 'w-5 bg-ink' : 'w-1.5 bg-ink/30'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima imagem"
              class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bone/80 text-ink backdrop-blur transition-colors hover:bg-bone"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
