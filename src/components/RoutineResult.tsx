import { useState } from 'preact/hooks';
import type { RoutineResult, RoutineStepResult } from '../lib/types';
import { addToCart, openCart } from '../lib/cart';
import { brl } from '../lib/format';
import { productImage } from '../lib/images';

interface Props {
  result: RoutineResult;
  onRetake?: () => void;
}

function StepRow({ s }: { s: RoutineStepResult }) {
  return (
    <li class="flex gap-4 py-4">
      <a href={`/produto/${s.product.slug}`} class="h-20 w-16 shrink-0 overflow-hidden rounded-card bg-bone-200">
        <img src={productImage(s.product.image, 200)} alt="" width={64} height={80} class="h-full w-full object-cover" loading="lazy" />
      </a>
      <div class="min-w-0 flex-1">
        <p class="font-sans text-[11px] uppercase tracking-[0.14em] text-agua-dark">{s.stepLabel}</p>
        <a href={`/produto/${s.product.slug}`} class="font-display text-[17px] leading-snug text-ink hover:text-agua-dark">
          {s.product.name}
        </a>
        <p class="mt-0.5 font-sans text-[13px] leading-relaxed text-ink-muted">{s.reason}</p>
      </div>
      <span class="shrink-0 font-sans text-[13px] text-ink">{brl(s.product.price_cents)}</span>
    </li>
  );
}

export default function RoutineResultView({ result, onRetake }: Props) {
  const [added, setAdded] = useState(false);

  function addRoutine() {
    const seen = new Set<string>();
    for (const s of [...result.am, ...result.pm, ...(result.weekly ? [result.weekly] : [])]) {
      if (seen.has(s.product.id) || s.product.stock <= 0) continue;
      seen.add(s.product.id);
      addToCart({
        productId: s.product.id,
        slug: s.product.slug,
        name: s.product.name,
        priceCents: s.product.price_cents,
        image: s.product.image,
        stock: s.product.stock,
      });
    }
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <p class="eyebrow">Sua rotina</p>
      <h2 class="mt-3 font-display text-3xl sm:text-4xl">{result.summary}</h2>

      {result.flags.length > 0 && (
        <ul class="mt-5 space-y-1.5">
          {result.flags.map((f) => (
            <li class="flex gap-2 font-sans text-[13px] text-ink-soft">
              <span class="text-agua-dark">•</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div class="mt-10 grid gap-10 md:grid-cols-2">
        <section>
          <h3 class="font-display text-xl">Manhã</h3>
          <ul class="mt-2 divide-y divide-ink/10 border-y border-ink/10">
            {result.am.map((s) => <StepRow s={s} key={`am-${s.step}-${s.product.id}`} />)}
          </ul>
        </section>
        <section>
          <h3 class="font-display text-xl">Noite</h3>
          <ul class="mt-2 divide-y divide-ink/10 border-y border-ink/10">
            {result.pm.map((s) => <StepRow s={s} key={`pm-${s.step}-${s.product.id}`} />)}
          </ul>
        </section>
      </div>

      {result.weekly && (
        <section class="mt-8">
          <h3 class="font-display text-xl">1× por semana</h3>
          <ul class="mt-2 divide-y divide-ink/10 border-y border-ink/10">
            <StepRow s={result.weekly} />
          </ul>
        </section>
      )}

      <div class="mt-10 flex flex-col gap-4 rounded-card border border-ink/10 bg-white/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-sans text-[13px] text-ink-muted">Rotina completa</p>
          <p class="font-display text-2xl text-ink">{brl(result.totalCents)}</p>
          <p class="font-sans text-[12px] text-ink-muted">Cada frasco dura, em média, 2 a 3 meses.</p>
        </div>
        <button type="button" class="btn-primary" onClick={addRoutine}>
          {added ? 'Adicionado à sacola ✓' : 'Adicionar rotina à sacola'}
        </button>
      </div>

      <div class="mt-6 flex flex-wrap gap-4 font-sans text-[13px]">
        {onRetake && (
          <button type="button" class="link-underline text-ink" onClick={onRetake}>Refazer o teste</button>
        )}
        <a href="/loja" class="link-underline text-ink">Ver a loja completa</a>
      </div>

      <p class="mt-8 max-w-prose font-sans text-[12px] leading-relaxed text-ink-muted">
        Esta rotina é uma sugestão baseada nas suas respostas e não substitui a avaliação de
        um dermatologista. Introduza um produto novo por vez e faça teste de sensibilidade.
      </p>
    </div>
  );
}
