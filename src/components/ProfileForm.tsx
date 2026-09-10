import { useState } from 'preact/hooks';
import type { Profile } from '../lib/types';
import { formatCpf, formatPhone, isValidCpf, isValidPhone } from '../lib/format';

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    full_name: profile.full_name,
    phone: formatPhone(profile.phone),
    cpf: formatCpf(profile.cpf),
  });
  const [state, setState] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  function upd(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setState('idle');
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (form.phone && !isValidPhone(form.phone)) {
      setError('Telefone inválido — informe com DDD.');
      setState('error');
      return;
    }
    if (form.cpf && !isValidCpf(form.cpf)) {
      setError('CPF inválido.');
      setState('error');
      return;
    }
    setState('saving');
    setError('');
    const res = await fetch('/api/account/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setState('ok');
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Erro ao salvar.');
      setState('error');
    }
  }

  return (
    <form onSubmit={submit} class="max-w-md space-y-4">
      {state === 'ok' && (
        <p class="rounded-card border border-agua/40 bg-agua-wash px-3 py-2 text-sm text-agua-dark">Dados salvos.</p>
      )}
      {state === 'error' && (
        <p class="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
      <label class="block">
        <span class="label">Nome completo</span>
        <input class="field" value={form.full_name} onInput={(e) => upd('full_name', (e.target as HTMLInputElement).value)} required />
      </label>
      <label class="block">
        <span class="label">Telefone / WhatsApp</span>
        <input class="field" inputMode="tel" value={form.phone} onInput={(e) => upd('phone', formatPhone((e.target as HTMLInputElement).value))} placeholder="(11) 90000-0000" />
      </label>
      <label class="block">
        <span class="label">CPF</span>
        <input class="field" inputMode="numeric" value={form.cpf} onInput={(e) => upd('cpf', formatCpf((e.target as HTMLInputElement).value))} placeholder="000.000.000-00" />
      </label>
      <button type="submit" class="btn-primary" disabled={state === 'saving'}>
        {state === 'saving' ? 'Salvando…' : 'Salvar dados'}
      </button>
    </form>
  );
}
