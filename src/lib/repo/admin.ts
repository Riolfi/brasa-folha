import { hasSupabase } from '../env';
import { supabaseAdmin } from '../supabase';

/**
 * Essa conta tem acesso à área administrativa? Sempre reconsulta o banco —
 * nunca confia em nada vindo do cliente. `admin_users` não tem nenhuma RLS
 * policy, então só o client service-role (usado aqui) consegue lê-la;
 * promover alguém a admin é sempre uma ação manual (SQL editor/service role),
 * nunca alcançável por uma API pública.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const sb = supabaseAdmin();
  if (!hasSupabase || !sb) return false;
  const { data, error } = await sb.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) {
    console.warn('[admin] isAdmin falhou:', error.message);
    return false;
  }
  return !!data;
}
