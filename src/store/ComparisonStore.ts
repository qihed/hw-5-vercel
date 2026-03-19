import { makeAutoObservable } from 'mobx';
import type { Product } from 'api/types';

export const COMPARISON_MAX_PRODUCTS = 12;
const normalizeDocId = (id: string) => id.trim();

export class ComparisonStore {
  products: Product[] = [];

  constructor(initialProducts: Product[] = []) {
    makeAutoObservable(this);
    this.products = this.normalize(initialProducts);
  }

  private normalize(products: Product[]): Product[] {
    const seen = new Set<string>();
    const result: Product[] = [];
    for (const p of products) {
      const docId = normalizeDocId(p.documentId);
      if (!docId || seen.has(docId)) continue;
      seen.add(docId);
      result.push({ ...p, documentId: docId });
      if (result.length >= COMPARISON_MAX_PRODUCTS) break;
    }
    return result;
  }

  addProduct(product: Product) {
    const docId = normalizeDocId(product.documentId);
    if (!docId) return;
    if (this.products.some((p) => p.documentId === docId)) return;
    if (this.products.length >= COMPARISON_MAX_PRODUCTS) return;
    this.products = [...this.products, { ...product, documentId: docId }];
  }

  removeProduct(documentId: string) {
    const docId = normalizeDocId(documentId);
    this.products = this.products.filter((p) => p.documentId !== docId);
  }

  clear() {
    this.products = [];
  }

  get count(): number {
    return this.products.length;
  }

  hasProduct(documentId: string): boolean {
    const docId = normalizeDocId(documentId);
    return this.products.some((p) => p.documentId === docId);
  }
}
