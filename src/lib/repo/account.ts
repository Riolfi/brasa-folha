import type { SupabaseClient } from '@supabase/supabase-js';
import type { Address, Profile } from '../types';
import { onlyDigits } from '../format';

/**
 * Acesso ao perfil e endereços do cliente. Recebe SEMPRE o client escopado à
 * sessão (`Astro.locals.supabase`) — o RLS garante que o usuário só vê/edita o
 * que é dele.
 */

export async function getProfile(sb: SupabaseClient, userId: string): Promise<Profile> {
  const { data } = await sb
    .from('profiles')
    .select('id, full_name, phone, cpf')
    .eq('id', userId)
    .maybeSingle();
  return {
    id: userId,
    full_name: data?.full_name ?? '',
    phone: data?.phone ?? '',
    cpf: data?.cpf ?? '',
  };
}

export async function upsertProfile(
  sb: SupabaseClient,
  userId: string,
  input: { full_name: string; phone: string; cpf: string },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.from('profiles').upsert({
    id: userId,
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    cpf: onlyDigits(input.cpf),
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function listAddresses(sb: SupabaseClient): Promise<Address[]> {
  const { data, error } = await sb
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Address[];
}

export interface AddressInput {
  id?: string;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  is_default: boolean;
}

export async function saveAddress(
  sb: SupabaseClient,
  userId: string,
  input: AddressInput,
): Promise<{ ok: boolean; error?: string }> {
  const row = {
    user_id: userId,
    label: input.label.trim() || 'Endereço',
    cep: onlyDigits(input.cep),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: input.complement.trim(),
    district: input.district.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase().slice(0, 2),
    is_default: input.is_default,
  };

  if (input.is_default) {
    await sb.from('addresses').update({ is_default: false }).eq('user_id', userId);
  }

  const { error } = input.id
    ? await sb.from('addresses').update(row).eq('id', input.id)
    : await sb.from('addresses').insert(row);

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteAddress(sb: SupabaseClient, id: string): Promise<{ ok: boolean }> {
  const { error } = await sb.from('addresses').delete().eq('id', id);
  return { ok: !error };
}
