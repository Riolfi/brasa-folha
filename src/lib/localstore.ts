/**
 * Persistência local para o MODO FALLBACK (sem Supabase configurado).
 * Grava em `.data/` na raiz do projeto. Funciona no `astro dev` / `astro preview`
 * local; em produção serverless o filesystem é somente-leitura — por isso
 * produção EXIGE Supabase (ver SETUP.md).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import bundledCatalog from '../data/catalog.json';
import type { Offer, Order } from './types';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');
const SITE_FILE = path.join(DATA_DIR, 'site.json');
const EMAILS_DIR = path.join(DATA_DIR, 'emails');

interface RawCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
  image_url?: string;
  parent_id?: string | null;
}
interface RawProduct {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  ingredients: string;
  how_to_use: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  barcode?: string | null;
  is_active: boolean;
  is_bestseller: boolean;
  rating: number | null;
  reviews_count: number;
  images: string[];
}
export interface RawCatalog {
  categories: RawCategory[];
  products: RawProduct[];
}

async function ensureDir(dir: string): Promise<boolean> {
  try {
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, data: unknown): Promise<boolean> {
  if (!(await ensureDir(path.dirname(file)))) return false;
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function readCatalog(): Promise<RawCatalog> {
  const override = await readJson<RawCatalog>(CATALOG_FILE);
  if (override && Array.isArray(override.products)) return override;
  return bundledCatalog as RawCatalog;
}

export async function writeCatalog(data: RawCatalog): Promise<boolean> {
  return writeJson(CATALOG_FILE, data);
}

export async function readOrders(): Promise<Order[]> {
  return (await readJson<Order[]>(ORDERS_FILE)) ?? [];
}

export async function writeOrders(orders: Order[]): Promise<boolean> {
  return writeJson(ORDERS_FILE, orders);
}

export async function readOffers(): Promise<Offer[] | null> {
  return readJson<Offer[]>(OFFERS_FILE);
}

export async function writeOffers(offers: Offer[]): Promise<boolean> {
  return writeJson(OFFERS_FILE, offers);
}

export async function readSiteContent(): Promise<Record<string, unknown>> {
  return (await readJson<Record<string, unknown>>(SITE_FILE)) ?? {};
}

export async function writeSiteContent(content: Record<string, unknown>): Promise<boolean> {
  return writeJson(SITE_FILE, content);
}

export async function writeEmailFile(name: string, html: string): Promise<string | null> {
  if (!(await ensureDir(EMAILS_DIR))) return null;
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const file = path.join(EMAILS_DIR, `${safe}.html`);
  try {
    await fs.writeFile(file, html, 'utf-8');
    return file;
  } catch {
    return null;
  }
}
