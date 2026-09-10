import { useEffect, useState } from 'preact/hooks';
import { QUIZ_QUESTIONS } from '../lib/quiz/questions';
import type { QuizAnswers, RoutineResult } from '../lib/types';
import RoutineResultView from './RoutineResult';

export default function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoutineResult | null>(null);

  useEffect(() => {
    for (const id of ['rotina-intro', 'rotina-intro-extra']) {
      const el = document.getElementById(id);
      if (el) el.hidden = Boolean(result);
    }
  }, [result]);

  const q = QUIZ_QUESTIONS[step]!;
  const total = QUIZ_QUESTIONS.length;
  const current = answers[q.id];
  const selected = Array.isArray(current) ? current : current ? [current] : [];

  function choose(value: string) {
    if (q.type === 'single') {
      setAnswers((a) => ({ ...a, [q.id]: value }));
      window.setTimeout(() => advance({ ...answers, [q.id]: value }), 180);
    } else {
      const has = selected.includes(value);
      let next = has ? selected.filter((v) => v !== value) : [...selected, value];
      if (q.max && next.length > q.max) next = next.slice(1);
      setAnswers((a) => ({ ...a, [q.id]: next }));
    }
  }

  function canAdvance(): boolean {
    if (q.type === 'multi') return selected.length > 0;
    return Boolean(current);
  }

  async function advance(currentAnswers = answers) {
    setError(null);
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: currentAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao montar a rotina.');
      setResult(data.result);
      try {
        window.history.replaceState({}, '', `/rotina/${data.token}`);
      } catch { /* ignore */ }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao montar a rotina.');
    } finally {
      setSubmitting(false);
    }
  }

  function retake() {
    setResult(null);
    setAnswers({});
    setStep(0);
    try {
      window.history.replaceState({}, '', '/rotina');
    } catch { /* ignore */ }
  }

  if (result) return <RoutineResultView result={result} onRetake={retake} />;

  const pct = Math.round(((step + (canAdvance() ? 1 : 0)) / total) * 100);

  return (
    <div class="mx-auto max-w-xl">
      <div class="mb-8">
        <div class="flex items-center justify-between font-sans text-[12px] uppercase tracking-[0.14em] text-ink-muted">
          <span>Pergunta {step + 1} de {total}</span>
          <button
            type="button"
            class="hover:text-ink disabled:opacity-30"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            ← Voltar
          </button>
        </div>
        <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <div class="h-full rounded-full bg-agua transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 class="font-display text-2xl leading-snug sm:text-3xl">{q.title}</h2>
      {q.help && <p class="mt-2 font-sans text-[13px] text-ink-muted">{q.help}</p>}

      <div class="mt-6 grid gap-3">
        {q.options.map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              class={`flex items-center justify-between rounded-card border px-4 py-3.5 text-left font-sans text-[15px] transition-colors ${
                on ? 'border-ink bg-ink text-bone' : 'border-ink/20 text-ink hover:border-ink'
              }`}
            >
              <span>
                {opt.label}
                {opt.hint && (
                  <span class={`ml-2 text-[12px] ${on ? 'text-bone/60' : 'text-ink-muted'}`}>— {opt.hint}</span>
                )}
              </span>
              {q.type === 'multi' && (
                <span class={`ml-3 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${on ? 'border-bone bg-bone text-ink' : 'border-ink/30'}`}>
                  {on ? '✓' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p class="mt-4 rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      {q.type === 'multi' && (
        <button
          type="button"
          class="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => advance()}
          disabled={!canAdvance() || submitting}
        >
          {submitting ? 'Montando sua rotina…' : step < total - 1 ? 'Continuar' : 'Ver minha rotina'}
        </button>
      )}

      {submitting && q.type === 'single' && (
        <p class="mt-6 text-center font-sans text-sm text-ink-muted">Montando sua rotina…</p>
      )}
    </div>
  );
}
