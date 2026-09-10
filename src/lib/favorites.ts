import { computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

/** Slugs dos produtos favoritados, do mais recente ao mais antigo. Persistido em localStorage. */
export const favoriteSlugs = persistentAtom<string[]>('iarah:favorites:v1', [], {
  encode: JSON.stringify,
  decode: (raw) => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
    } catch {
      return [];
    }
  },
});

export const favoriteCount = computed(favoriteSlugs, (slugs) => slugs.length);

export function isFavorite(slug: string): boolean {
  return favoriteSlugs.get().includes(slug);
}

/** Alterna o favorito e devolve o novo estado (true = favoritado). */
export function toggleFavorite(slug: string): boolean {
  const current = favoriteSlugs.get();
  if (current.includes(slug)) {
    favoriteSlugs.set(current.filter((s) => s !== slug));
    return false;
  }
  favoriteSlugs.set([slug, ...current]);
  return true;
}

export function removeFavorite(slug: string): void {
  favoriteSlugs.set(favoriteSlugs.get().filter((s) => s !== slug));
}
