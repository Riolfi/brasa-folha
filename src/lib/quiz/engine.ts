import type {
  Concern,
  Product,
  QuizAnswers,
  RoutineResult,
  RoutineStep,
  RoutineStepResult,
  SkinType,
} from '../types';
import { ROUTINE_STEP_LABELS, CONCERN_LABELS, SKIN_TYPE_LABELS } from '../types';
import { firstImage } from '../images';
import { reasonFor } from './reasons';

interface Ctx {
  skinType: SkinType | null;
  sensitivity: 'nao' | 'as-vezes' | 'muito';
  concerns: Concern[];
  experience: 'nenhuma' | 'basico' | 'avancado';
  pregnant: boolean;
  fragranceFree: boolean;
  budgetCents: number;
}

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
}
function list(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** Expande as escolhas do quiz para as preocupações internas do catálogo. */
function expandConcerns(picked: string[]): Concern[] {
  const out = new Set<Concern>();
  for (const c of picked) {
    if (c === 'acne') { out.add('acne'); out.add('oleosidade'); }
    else if (c === 'oleosidade') { out.add('oleosidade'); out.add('poros'); }
    else if (c === 'linhas-finas') { out.add('linhas-finas'); out.add('firmeza'); }
    else if (c === 'manchas') { out.add('manchas'); out.add('tom-irregular'); }
    else if (c === 'desidratacao') out.add('desidratacao');
    else if (c === 'vermelhidao') out.add('vermelhidao');
    else if (c === 'opacidade') out.add('opacidade');
  }
  return [...out];
}

function parseAnswers(answers: QuizAnswers): Ctx {
  const st = str(answers.skin_type);
  const budget = str(answers.budget);
  return {
    skinType: (['oleosa', 'seca', 'mista', 'normal'] as string[]).includes(st)
      ? (st as SkinType)
      : null,
    sensitivity: (['nao', 'as-vezes', 'muito'] as const).includes(str(answers.sensitivity) as Ctx['sensitivity'])
      ? (str(answers.sensitivity) as Ctx['sensitivity'])
      : 'nao',
    concerns: expandConcerns(list(answers.concerns)),
    experience: (['nenhuma', 'basico', 'avancado'] as const).includes(str(answers.experience) as Ctx['experience'])
      ? (str(answers.experience) as Ctx['experience'])
      : 'nenhuma',
    pregnant: str(answers.pregnancy) === 'sim',
    fragranceFree: str(answers.fragrance) === 'sem-perfume',
    budgetCents: budget === 'ate-150' ? 15000 : budget === '150-300' ? 30000 : Number.MAX_SAFE_INTEGER,
  };
}

function score(p: Product, ctx: Ctx): number {
  const a = p.attributes;
  let s = 0;

  if (ctx.skinType) s += a.skin_types.includes(ctx.skinType) ? 3 : a.skin_types.length === 0 ? 1 : -1;
  else s += 1;

  const matched = ctx.concerns.filter((c) => a.concerns.includes(c)).length;
  s += Math.min(matched, 3) * 2;

  if (p.is_bestseller) s += 1;
  s += (p.rating ?? 4) * 0.4;

  if (a.strength === 'potente') {
    if (ctx.experience === 'nenhuma') s -= 3;
    else if (ctx.experience === 'avancado') s += 1;
    if (ctx.sensitivity === 'as-vezes') s -= 1;
  }

  if (ctx.fragranceFree && /parfum/i.test(p.ingredients)) s -= 2;

  return s;
}

function timeOk(p: Product, time: 'am' | 'pm'): boolean {
  const t = p.attributes.time_of_day;
  return t === null || t === 'ambos' || t === time;
}

function pick(
  pool: Product[],
  steps: RoutineStep[],
  time: 'am' | 'pm',
  ctx: Ctx,
  used: Set<string>,
  minScore = -Infinity,
): { product: Product; score: number } | null {
  const cands = pool
    .filter((p) => p.attributes.routine_step && steps.includes(p.attributes.routine_step))
    .filter((p) => timeOk(p, time))
    .filter((p) => !used.has(p.id))
    .map((p) => ({ product: p, score: score(p, ctx) }))
    .sort((x, y) => y.score - x.score);
  const best = cands[0];
  return best && best.score >= minScore ? best : null;
}

function toStep(step: RoutineStep, product: Product, ctx: Ctx): RoutineStepResult {
  return {
    step,
    stepLabel: ROUTINE_STEP_LABELS[step],
    reason: reasonFor(step, ctx.concerns, ctx.skinType),
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price_cents: product.price_cents,
      image: firstImage(product.images, 400),
      stock: product.stock,
    },
  };
}

export function buildRoutine(answers: QuizAnswers, allProducts: Product[]): RoutineResult {
  const ctx = parseAnswers(answers);
  const flags: string[] = [];

  let pool = allProducts.filter(
    (p) => p.is_active && p.category_slug !== 'kits' && p.attributes.routine_step,
  );

  const restrictActives = ctx.pregnant || ctx.sensitivity === 'muito';
  if (restrictActives) {
    pool = pool.filter((p) => p.attributes.strength !== 'potente' && p.attributes.pregnancy_safe);
    flags.push(
      ctx.pregnant
        ? 'Retinal e ácidos fortes ficaram de fora — não são recomendados na gravidez ou amamentação.'
        : 'Priorizamos fórmulas suaves e sem ativos agressivos pela sua pele sensível.',
    );
  }
  if (ctx.fragranceFree) flags.push('Demos preferência a fórmulas sem perfume.');

  const usedTreatments = new Set<string>();

  // ---- Manhã ----
  const am: RoutineStepResult[] = [];
  const cleanser = pick(pool, ['limpeza'], 'am', ctx, new Set());
  if (cleanser) am.push(toStep('limpeza', cleanser.product, ctx));

  const amTreat = pick(pool, ['tratamento'], 'am', ctx, usedTreatments, 4);
  if (amTreat && amTreat.product.attributes.time_of_day === 'am') {
    usedTreatments.add(amTreat.product.id);
    am.push(toStep('tratamento', amTreat.product, ctx));
  }

  const moisturizer = pick(pool, ['hidratacao'], 'am', ctx, new Set());
  if (moisturizer) am.push(toStep('hidratacao', moisturizer.product, ctx));

  const spf = pick(pool, ['protecao'], 'am', ctx, new Set());
  if (spf) am.push(toStep('protecao', spf.product, ctx));

  // ---- Noite ----
  const pm: RoutineStepResult[] = [];
  if (cleanser) pm.push(toStep('limpeza', cleanser.product, ctx));

  const pmTreat = pick(pool, ['tratamento'], 'pm', ctx, usedTreatments, 3.5);
  if (pmTreat) {
    usedTreatments.add(pmTreat.product.id);
    pm.push(toStep('tratamento', pmTreat.product, ctx));
  }

  // hidratante da noite: mais rico se a pele for seca
  let pmMoist = moisturizer;
  if (ctx.skinType === 'seca') {
    const rich = pool
      .filter((p) => p.attributes.routine_step === 'hidratacao' && p.attributes.skin_types.includes('seca'))
      .sort((a, b) => b.price_cents - a.price_cents)[0];
    if (rich) pmMoist = { product: rich, score: 0 };
  }
  if (pmMoist) pm.push(toStep('hidratacao', pmMoist.product, ctx));

  // ---- Semanal (máscara) ----
  let weekly: RoutineStepResult | null = null;
  const maskCand = allProducts
    .filter((p) => p.is_active && p.category_slug === 'mascaras' && p.stock > 0)
    .filter((p) => !restrictActives || p.attributes.strength !== 'potente')
    .map((p) => ({ product: p, score: score(p, ctx) }))
    .sort((a, b) => b.score - a.score)[0];
  if (maskCand && maskCand.score >= 3) {
    const maskStep = maskCand.product.attributes.routine_step ?? 'esfoliacao';
    weekly = toStep(maskStep, maskCand.product, ctx);
    weekly.stepLabel = 'Máscara';
  }

  // ---- Orçamento ----
  const distinct = () => {
    const ids = new Set<string>();
    let cents = 0;
    for (const s of [...am, ...pm, ...(weekly ? [weekly] : [])]) {
      if (!ids.has(s.product.id)) {
        ids.add(s.product.id);
        cents += s.product.price_cents;
      }
    }
    return cents;
  };

  // Cada frasco dura ~2,5 meses; comparamos o custo mensal amortizado com a faixa.
  const MONTHS = 2.5;
  const monthly = () => distinct() / MONTHS;

  if (monthly() > ctx.budgetCents && weekly) {
    weekly = null;
    flags.push('Deixamos a máscara semanal como opcional para manter a rotina no seu orçamento.');
  }
  if (monthly() > ctx.budgetCents && am.length > 3) {
    const idx = am.findIndex((s) => s.step === 'tratamento');
    if (idx >= 0) {
      am.splice(idx, 1);
      flags.push('Começamos sem o tratamento da manhã — dá para adicionar quando a rotina virar hábito.');
    }
  }
  if (monthly() > ctx.budgetCents) {
    flags.push('Diluído ao longo do uso (cada produto rende 2 a 3 meses), o custo fica perto da faixa que você marcou.');
  }

  // ---- Resumo ----
  const skinLabel = ctx.skinType ? SKIN_TYPE_LABELS[ctx.skinType].toLowerCase() : 'do seu tipo';
  const concernLabels = ctx.concerns
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .slice(0, 3)
    .map((c) => CONCERN_LABELS[c].toLowerCase());
  const summary = concernLabels.length
    ? `Uma rotina para pele ${skinLabel}, focada em ${concernLabels.join(', ')}.`
    : `Uma rotina essencial para manter a pele ${skinLabel} equilibrada.`;

  return { summary, flags, am, pm, weekly, totalCents: distinct() };
}
