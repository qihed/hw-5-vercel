import { makeAutoObservable, observable } from 'mobx';
import type { Product } from 'api/types';
import * as productPropsRepository from '../adapters/productPropsRepository';
import type { ProductExtendedProps } from '../adapters/productPropsRepository';

export class ProductPropsStore {
  private readonly byDocumentId = observable.map<string, ProductExtendedProps>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  getByDocumentId(documentId: string): ProductExtendedProps | undefined {
    return this.byDocumentId.get(documentId);
  }

  ensureForProduct(product: Product): ProductExtendedProps {
    const existing = this.byDocumentId.get(product.documentId);
    if (existing) return existing;

    const props = productPropsRepository.ensureForProduct(product);
    this.byDocumentId.set(product.documentId, props);
    return props;
  }

  ensureForProducts(products: Product[]): void {
    for (const p of products) {
      this.ensureForProduct(p);
    }
  }

  // Not used yet, but useful for future cleanup policies.
  removeByDocumentId(documentId: string): void {
    this.byDocumentId.delete(documentId);
    productPropsRepository.removeByDocumentId(documentId);
  }

  clearForProducts(products: Product[]): void {
    for (const p of products) {
      this.removeByDocumentId(p.documentId);
    }
  }
}

