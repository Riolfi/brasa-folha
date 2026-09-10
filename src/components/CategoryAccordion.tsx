import { useState } from 'preact/hooks';

interface SubNode {
  slug: string;
  name: string;
  products: { slug: string; name: string }[];
}
interface RootNode {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  children: SubNode[];
}

function bg(url: string): string {
  if (!url) return '';
  const u = /unsplash\.com\//.test(url) ? `${url.split('?')[0]}?auto=format&fit=crop&q=65&w=1600` : url;
  return `url("${u}")`;
}

export default function CategoryAccordion({ roots }: { roots: RootNode[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div class="w-full divide-y divide-ink/10 border-y border-ink/10">
      {roots.map((root) => {
        const isOpen = open === root.id;
        return (
          <div key={root.id}>
            {/* nível 1 — botão */}
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : root.id)}
              aria-expanded={isOpen}
              class="relative flex w-full items-end overflow-hidden bg-ink text-left text-bone transition-[height] duration-300"
              style={{
                height: isOpen ? '176px' : '120px',
                backgroundImage: bg(root.image),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <span class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
              <span class="container-x relative z-10 flex w-full items-end justify-between gap-4 py-5">
                <span>
                  <span class="block font-display text-xl text-bone sm:text-2xl">{root.name}</span>
                  {root.description && (
                    <span class="mt-0.5 block max-w-md font-sans text-[13px] leading-snug text-bone/70">
                      {root.description}
                    </span>
                  )}
                </span>
                <span class={`shrink-0 text-2xl text-bone/80 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
              </span>
            </button>

            {/* nível 2 (colunas) + nível 3 (produtos) */}
            <div
              class="overflow-hidden bg-bone-50 transition-[max-height] duration-300 ease-smooth"
              style={{ maxHeight: isOpen ? '760px' : '0px' }}
            >
              {root.children.length > 0 ? (
                <div class="container-x grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-3 lg:grid-cols-4">
                  {root.children.map((sub) => (
                    <div key={sub.slug}>
                      <a
                        href={`/loja?categoria=${sub.slug}`}
                        class="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-agua-dark"
                      >
                        {sub.name}
                      </a>
                      <ul class="mt-2.5 space-y-1.5">
                        {sub.products.slice(0, 8).map((pr) => (
                          <li key={pr.slug}>
                            <a
                              href={`/produto/${pr.slug}`}
                              class="font-sans text-[14px] text-ink-soft transition-colors hover:text-agua-dark"
                            >
                              {pr.name}
                            </a>
                          </li>
                        ))}
                        {sub.products.length > 8 && (
                          <li>
                            <a href={`/loja?categoria=${sub.slug}`} class="font-sans text-[13px] text-agua-dark hover:underline">
                              + {sub.products.length - 8} produtos
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="container-x py-6">
                  <a href={`/loja?categoria=${root.slug}`} class="link-underline font-sans text-[14px] text-ink">
                    Ver produtos de {root.name}
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
