import type { Offer, SiteContent } from './types';
import offers from '../data/offers.default.json';
import siteContent from '../data/site-content.default.json';

/**
 * Conteúdo padrão do site. É o que um clone novo mostra antes de qualquer
 * edição no admin e o que o botão "restaurar padrão" usa.
 */
export const DEFAULT_OFFERS: Offer[] = offers as Offer[];
export const DEFAULT_SITE_CONTENT: SiteContent = siteContent as SiteContent;
