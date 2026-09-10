import type { QuizAnswers, RoutineResult, SkinQuiz } from '../types';
import { hasSupabase } from '../env';
import { supabaseAdmin } from '../supabase';
import { readQuizzes, writeQuizzes } from '../localstore';

function newToken(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToQuiz(row: any): SkinQuiz {
  return {
    id: row.id,
    token: row.token,
    user_id: row.user_id ?? null,
    answers: row.answers,
    result: row.result,
    created_at: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function saveQuiz(input: {
  answers: QuizAnswers;
  result: RoutineResult;
  userId: string | null;
}): Promise<SkinQuiz> {
  const token = newToken();
  const now = new Date().toISOString();

  const sb = supabaseAdmin();
  if (hasSupabase && sb) {
    const { data, error } = await sb
      .from('skin_quizzes')
      .insert({ token, user_id: input.userId, answers: input.answers, result: input.result })
      .select()
      .single();
    if (error) throw error;
    return rowToQuiz(data);
  }

  const quiz: SkinQuiz = {
    id: crypto.randomUUID(),
    token,
    user_id: input.userId,
    answers: input.answers,
    result: input.result,
    created_at: now,
  };
  const all = await readQuizzes();
  all.unshift(quiz);
  await writeQuizzes(all.slice(0, 500));
  return quiz;
}

export async function getQuizByToken(token: string): Promise<SkinQuiz | null> {
  const sb = supabaseAdmin();
  if (hasSupabase && sb) {
    const { data } = await sb.from('skin_quizzes').select('*').eq('token', token).maybeSingle();
    return data ? rowToQuiz(data) : null;
  }
  const all = await readQuizzes();
  return all.find((q) => q.token === token) ?? null;
}

export async function getLatestQuizForUser(userId: string): Promise<SkinQuiz | null> {
  const sb = supabaseAdmin();
  if (hasSupabase && sb) {
    const { data } = await sb
      .from('skin_quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? rowToQuiz(data) : null;
  }
  const all = await readQuizzes();
  return all.find((q) => q.user_id === userId) ?? null;
}
