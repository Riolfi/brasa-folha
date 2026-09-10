import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase, hasSupabasePublic } from './env';

let adminClient: SupabaseClient | null = null;
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
