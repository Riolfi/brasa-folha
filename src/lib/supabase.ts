import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase, hasSupabasePublic } from './env';

/** Marca gravada em `store_identity` (migration 0011) no banco desta loja. */
export const STORE_ID = 'visionario';

let adminClient: SupabaseClient | null = null;
let identityOk = false;
let publicClient: SupabaseClient | null = null;

/**
 * Client com service-role — ignora RLS. USO EXCLUSIVO NO SERVIDOR
 * (APIs, páginas SSR, admin). Nunca importe isto em código de cliente.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/** Client anônimo — respeita RLS. Pode ser usado em leitura de catálogo. */
export function supabasePublic(): SupabaseClient | null {
  if (!hasSupabasePublic) return null;
  if (!publicClient) {
    publicClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

/**
 * Confere que o Supabase configurado é o desta loja. Devolve o motivo da
 * recusa, ou null se está tudo certo. Impede que um .env apontando para o
 * banco de outra loja (já aconteceu com a Iarah) leia ou grave dados dela.
 */
export async function checkStoreIdentity(): Promise<string | null> {
  const sb = supabaseAdmin();
  if (!sb || identityOk) return null;
  const { data, error } = await sb.from('store_identity').select('store').maybeSingle();
  if (error) {
    const missing = /store_identity/.test(error.message) ? ' — rode a migration 0011' : '';
    return `não consegui ler store_identity (${error.message})${missing}`;
  }
  if (!data) return 'banco sem marca de loja — num banco novo, rode `npm run seed`';
  if (data.store !== STORE_ID) return `o banco pertence à loja "${data.store}"`;
  identityOk = true;
  return null;
}
