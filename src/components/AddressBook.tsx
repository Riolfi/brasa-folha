import { useState } from 'preact/hooks';
import type { Address } from '../lib/types';
import { formatCep, onlyDigits } from '../lib/format';

const empty = {
  id: undefined as string | undefined,
  label: 'Casa',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  is_default: false,
};

export default function AddressBook({ addresses }: { addresses: Address[] }) {
  const [list] = useState<Address[]>(addresses);
  const [form, setForm] = useState<typeof empty | null>(addresses.length ? null : { ...empty });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function upd(k: keyof typeof empty, v: string | boolean) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  function reload() {
    window.location.reload();
  }

  async function lookupCep(raw: string) {
    const cep = onlyDigits(raw);
    if (cep.length !== 8) return;
    const res = await fetch(`/api/cep/${cep}`).catch(() => null);
    const data = res && res.ok ? await res.json() : null;
    if (data?.address) {
      setForm((f) =>
        f ? { ...f, street: data.address.street || f.street, district: data.address.district || f.district, city: data.address.city || f.city, state: data.address.state || f.state } : f,
      );
    }
  }

  async function save(e: Event) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError('');
    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setForm(null);
      reload();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Erro ao salvar.');
    }
  }

  async function remove(id: string) {
    if (!confirm('Excluir este endereço?')) return;
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
    if (res.ok) reload();
  }

  return (
    <div class="space-y-6">
      {list.length > 0 && (
        <ul class="grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} class="rounded-card border border-ink/10 bg-white/50 p-4 text-[14px] text-ink-soft">
              <div class="flex items-center justify-between">
                <span class="font-sans text-[12px] uppercase tracking-[0.1em] text-ink-muted">
                  {a.label}{a.is_default ? ' · padrão' : ''}
                </span>
                <div class="flex gap-2 text-[12px]">
                  <button type="button" class="text-ink-muted hover:text-ink" onClick={() => setForm({ ...a, complement: a.complement || '' })}>editar</button>
                  <button type="button" class="text-red-700 hover:underline" onClick={() => remove(a.id)}>excluir</button>
                </div>
              </div>
              <p class="mt-2">
                {a.street}, {a.number}{a.complement ? ` — ${a.complement}` : ''}<br />
                {a.district ? `${a.district} — ` : ''}{a.city}/{a.state} · CEP {formatCep(a.cep)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {form ? (
        <form onSubmit={save} class="max-w-xl rounded-card border border-ink/10 bg-bone-50 p-5">
          <h3 class="font-display text-lg">{form.id ? 'Editar endereço' : 'Novo endereço'}</h3>
          {error && <p class="mt-3 rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div class="mt-4 grid gap-3 sm:grid-cols-6">
            <label class="block sm:col-span-3"><span class="label">Apelido</span>
              <input class="field" value={form.label} onInput={(e) => upd('label', (e.target as HTMLInputElement).value)} /></label>
            <label class="block sm:col-span-3"><span class="label">CEP</span>
              <input class="field" value={form.cep} onInput={(e) => upd('cep', formatCep((e.target as HTMLInputElement).value))} onBlur={(e) => lookupCep((e.target as HTMLInputElement).value)} required /></label>
            <label class="block sm:col-span-4"><span class="label">Rua</span>
              <input class="field" value={form.street} onInput={(e) => upd('street', (e.target as HTMLInputElement).value)} required /></label>
            <label class="block sm:col-span-2"><span class="label">Número</span>
              <input class="field" value={form.number} onInput={(e) => upd('number', (e.target as HTMLInputElement).value)} required /></label>
            <label class="block sm:col-span-3"><span class="label">Complemento</span>
              <input class="field" value={form.complement} onInput={(e) => upd('complement', (e.target as HTMLInputElement).value)} /></label>
            <label class="block sm:col-span-3"><span class="label">Bairro</span>
              <input class="field" value={form.district} onInput={(e) => upd('district', (e.target as HTMLInputElement).value)} /></label>
            <label class="block sm:col-span-4"><span class="label">Cidade</span>
              <input class="field" value={form.city} onInput={(e) => upd('city', (e.target as HTMLInputElement).value)} required /></label>
            <label class="block sm:col-span-2"><span class="label">UF</span>
              <input class="field" value={form.state} maxLength={2} onInput={(e) => upd('state', (e.target as HTMLInputElement).value.toUpperCase())} required /></label>
          </div>
          <label class="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={(e) => upd('is_default', (e.target as HTMLInputElement).checked)} />
            Usar como endereço padrão
          </label>
          <div class="mt-4 flex gap-2">
            <button type="submit" class="btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar endereço'}</button>
            {list.length > 0 && <button type="button" class="btn-outline" onClick={() => setForm(null)}>Cancelar</button>}
          </div>
        </form>
      ) : (
        <button type="button" class="btn-outline" onClick={() => setForm({ ...empty })}>+ Novo endereço</button>
      )}
    </div>
  );
}
