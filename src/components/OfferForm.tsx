import { useState } from 'preact/hooks';
import type { Offer } from '../lib/types';

export default function OfferForm({ offer }: { offer: Offer | null }) {
  const [form, setForm] = useState({
    image_url: offer?.image_url ?? '',
    eyebrow: offer?.eyebrow ?? '',
    title: offer?.title ?? '',
    subtitle: offer?.subtitle ?? '',
    cta_label: offer?.cta_label ?? '',
    cta_href: offer?.cta_href ?? '',
    is_active: offer?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upd<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', 'offers');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha no upload.');
      upd('image_url', data.urls[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  }

  async function submit(e: Event) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: offer?.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');
      window.location.href = '/admin/ofertas';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSaving(false);
    }
  }

  async function remove() {
    if (!offer || !confirm('Excluir esta oferta?')) return;
    const res = await fetch(`/api/admin/offers?id=${offer.id}`, { method: 'DELETE' });
    if (res.ok) window.location.href = '/admin/ofertas';
  }

  return (
    <form onSubmit={submit} class="max-w-2xl space-y-5">
      {error && <p class="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <div>
        <span class="label">Imagem (tela cheia — use fotos horizontais grandes)</span>
        {form.image_url ? (
          <div class="relative mb-2 overflow-hidden rounded-card border border-ink/10">
            <img src={form.image_url} alt="" class="aspect-[16/7] w-full object-cover" />
            <button
              type="button"
              class="absolute right-2 top-2 rounded bg-ink/70 px-2 py-1 text-[11px] text-bone"
              onClick={() => upd('image_url', '')}
            >
              Remover
            </button>
          </div>
        ) : null}
        <div class="flex flex-wrap items-center gap-3">
          <label class="btn-outline cursor-pointer text-[13px]">
            {uploading ? 'Enviando…' : form.image_url ? 'Trocar imagem' : 'Enviar imagem'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden" onChange={onFile} disabled={uploading} />
          </label>
          <input
            class="field flex-1 text-[13px]"
            placeholder="ou cole uma URL de imagem"
            value={form.image_url}
            onInput={(e) => upd('image_url', (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <label class="block">
        <span class="label">Chapéu / eyebrow (opcional)</span>
        <input class="field" value={form.eyebrow} onInput={(e) => upd('eyebrow', (e.target as HTMLInputElement).value)} placeholder="ex.: Coleção de verão" />
      </label>
      <label class="block">
        <span class="label">Título</span>
        <input class="field" value={form.title} onInput={(e) => upd('title', (e.target as HTMLInputElement).value)} required />
      </label>
      <label class="block">
        <span class="label">Subtítulo (opcional)</span>
        <textarea class="field" rows={2} value={form.subtitle} onInput={(e) => upd('subtitle', (e.target as HTMLTextAreaElement).value)} />
      </label>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="label">Texto do botão</span>
          <input class="field" value={form.cta_label} onInput={(e) => upd('cta_label', (e.target as HTMLInputElement).value)} placeholder="ex.: Ver ofertas" />
        </label>
        <label class="block">
          <span class="label">Link do botão</span>
          <input class="field" value={form.cta_href} onInput={(e) => upd('cta_href', (e.target as HTMLInputElement).value)} placeholder="/loja?ordenar=preco-asc" />
        </label>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_active} onChange={(e) => upd('is_active', (e.target as HTMLInputElement).checked)} />
        Ativa (aparece no carrossel da home)
      </label>

      <div class="flex items-center gap-3 pt-2">
        <button type="submit" class="btn-primary" disabled={saving}>
          {saving ? 'Salvando…' : offer ? 'Salvar oferta' : 'Criar oferta'}
        </button>
        <a href="/admin/ofertas" class="btn-outline">Cancelar</a>
        {offer && (
          <button type="button" onClick={remove} class="ml-auto text-sm text-red-700 hover:underline">Excluir</button>
        )}
      </div>
    </form>
  );
}
