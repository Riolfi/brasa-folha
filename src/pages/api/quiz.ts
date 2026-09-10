import type { APIRoute } from 'astro';
import { getProducts } from '../../lib/repo/catalog';
import { buildRoutine } from '../../lib/quiz/engine';
import { saveQuiz } from '../../lib/repo/quiz';
import { QUIZ_QUESTIONS } from '../../lib/quiz/questions';
import { env } from '../../lib/env';
import type { QuizAnswers } from '../../lib/types';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!env.quizEnabled) return json({ error: 'Recurso indisponível.' }, 404);
  const body = (await request.json().catch(() => null)) as { answers?: QuizAnswers } | null;
  const raw = body?.answers;
  if (!raw || typeof raw !== 'object') return json({ error: 'Respostas inválidas.' }, 400);

  // valida contra as perguntas conhecidas
  const answers: QuizAnswers = {};
  for (const q of QUIZ_QUESTIONS) {
    const value = raw[q.id];
    if (q.type === 'multi') {
      const arr = Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
      answers[q.id] = q.max ? arr.slice(0, q.max) : arr;
    } else {
      answers[q.id] = typeof value === 'string' ? value : '';
    }
  }

  const required = ['skin_type', 'sensitivity', 'experience', 'pregnancy', 'budget'];
  if (required.some((id) => !answers[id])) {
    return json({ error: 'Responda todas as perguntas.' }, 422);
  }

  try {
    const products = await getProducts({});
    const tagged = products.filter((p) => p.attributes.routine_step).length;
    const result = buildRoutine(answers, products);
    if (result.am.length === 0 && result.pm.length === 0) {
      if (tagged === 0) {
        console.error(
          '[api/quiz] nenhum produto tem attributes.routine_step — rode a migration 0004_quiz.sql e `npm run seed`.',
        );
      }
      return json({ error: 'O teste de pele está indisponível no momento.' }, 503);
    }
    const quiz = await saveQuiz({ answers, result, userId: locals.user?.id ?? null });
    return json({ token: quiz.token, result });
  } catch (err) {
    console.error('[api/quiz] erro:', err);
    return json({ error: 'Erro ao montar a rotina.' }, 500);
  }
};
