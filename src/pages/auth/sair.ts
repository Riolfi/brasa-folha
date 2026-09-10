import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase?.auth.signOut();
  return redirect('/');
};

// permite logout via link também (ex.: menu simples)
export const GET: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase?.auth.signOut();
  return redirect('/');
};
