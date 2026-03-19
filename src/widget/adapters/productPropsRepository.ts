import type { Product } from 'api/types';
import { LocalStorageModel } from 'store/LocalStorageModel';

export type ProductExtendedProps = {
  material?: string;
  year?: string;
  company?: string;
  model?: string;
  warranty?: string;
  deliveryTime?: string;
};

const STORAGE_PREFIX = 'comparison_props_';

const MATERIALS = ['Натуральная кожа', 'Пластик', 'Металл', 'Дерево', 'Стекло', 'Текстиль', 'Алюминий', 'Сталь'];
const COMPANIES = ['Lalasia', 'HomeStyle', 'ModernLiving', 'EliteHome', 'TechHome', 'BestFurniture'];
const MODELS = ['LX-2000', 'Pro-Series', 'Classic', 'Ultra', 'Premium', 'Standard', 'Deluxe'];
const WARRANTY = ['6 месяцев', '1 год', '2 года', '3 года', '5 лет'];
const DELIVERY = ['1–3 дня', '3–5 дней', '5–7 дней', '7–14 дней', 'до 21 дня'];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomProps(): ProductExtendedProps {
  return {
    material: pickRandom(MATERIALS),
    year: String(2020 + Math.floor(Math.random() * 5)),
    company: pickRandom(COMPANIES),
    model: `${pickRandom(MODELS)}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    warranty: pickRandom(WARRANTY),
    deliveryTime: pickRandom(DELIVERY),
  };
}

function isProductExtendedProps(raw: unknown): raw is ProductExtendedProps {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  const keys: (keyof ProductExtendedProps)[] = [
    'material',
    'year',
    'company',
    'model',
    'warranty',
    'deliveryTime',
  ];
  for (const k of keys) {
    const v = obj[k];
    if (v == null) continue;
    if (typeof v !== 'string') return false;
  }
  return true;
}

export function getByDocumentId(documentId: string): ProductExtendedProps | null {
  const key = `${STORAGE_PREFIX}${documentId}`;
  const stored = LocalStorageModel.getItemJson<ProductExtendedProps | null>(key, null);
  if (!stored) return null;
  return isProductExtendedProps(stored) ? stored : null;
}

export function ensureForProduct(product: Product): ProductExtendedProps {
  const docId = product.documentId;
  const existing = getByDocumentId(docId);
  if (existing) return existing;
  const props = generateRandomProps();
  const key = `${STORAGE_PREFIX}${docId}`;
  LocalStorageModel.setItemJson(key, props);
  return props;
}

export function removeByDocumentId(documentId: string): void {
  const key = `${STORAGE_PREFIX}${documentId}`;
  LocalStorageModel.removeItem(key);
}

export function clearForProducts(products: Product[]): void {
  for (const p of products) {
    removeByDocumentId(p.documentId);
  }
}

