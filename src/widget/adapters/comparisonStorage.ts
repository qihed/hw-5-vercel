import type { Product } from 'api/types';
import { LocalStorageModel } from 'store/LocalStorageModel';

const STORAGE_KEY = 'comparison_products';
const normalizeDocId = (id: string) => id.trim();

function isProduct(raw: unknown): raw is Product {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.documentId === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.isInStock === 'boolean'
  );
}

export function loadComparisonProducts(maxProducts = 12): Product[] {
  const ids = LocalStorageModel.getItemJson<unknown>(STORAGE_KEY, []);
  if (!Array.isArray(ids)) return [];

  const result: Product[] = [];
  const seen = new Set<string>();

  for (const rawId of ids) {
    if (typeof rawId !== 'string') continue;
    const docId = normalizeDocId(rawId);
    if (!docId || seen.has(docId)) continue;
    const item = LocalStorageModel.getItemJson<unknown>(`${STORAGE_KEY}_${docId}`, null);
    if (!isProduct(item)) continue;
    result.push(item);
    seen.add(docId);
    if (result.length >= maxProducts) break;
  }

  return result;
}

export function saveComparisonProducts(products: Product[]): void {
  const ids = products
    .map((p) => normalizeDocId(p.documentId))
    .filter(Boolean);

  const oldIds = LocalStorageModel.getItemJson<unknown>(STORAGE_KEY, []);
  const oldIdList = Array.isArray(oldIds) ? oldIds.filter((x): x is string => typeof x === 'string') : [];

  LocalStorageModel.setItemJson(STORAGE_KEY, ids);
  for (const p of products) {
    const docId = normalizeDocId(p.documentId);
    if (!docId) continue;
    LocalStorageModel.setItemJson(`${STORAGE_KEY}_${docId}`, p);
  }

  for (const oldId of oldIdList) {
    if (!ids.includes(oldId)) {
      LocalStorageModel.removeItem(`${STORAGE_KEY}_${oldId}`);
    }
  }
}

