import { makeAutoObservable, runInAction } from 'mobx';
import type { Product, ProductCategory } from 'api/types';
import { getProductCategories, getProducts } from 'api/products';
import { MetaModel } from 'store/MetaModel';

type LoadProductsQuery = {
  page: number;
  search: string;
  categoryIds: number[];
};

export class CatalogStore {
  products: Product[] = [];
  total = 0;
  readonly productsMeta = new MetaModel();

  categories: ProductCategory[] = [];
  readonly categoriesMeta = new MetaModel();

  requestedPage = 1;
  readonly pageSize = 24;

  private requestId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get loadingProducts(): boolean {
    return this.productsMeta.loading;
  }

  get errorProducts(): Error | null {
    return this.productsMeta.error;
  }

  get loadingCategory(): boolean {
    return this.categoriesMeta.loading;
  }

  get errorCategory(): Error | null {
    return this.categoriesMeta.error;
  }

  async loadProducts(query: LoadProductsQuery) {
    const myRequest = ++this.requestId;

    this.requestedPage = query.page;
    this.productsMeta.start();

    try {
      const res = await getProducts({
        page: query.page,
        pageSize: this.pageSize,
        search: query.search,
        categoryIds: query.categoryIds,
        populate: ['images', 'productCategory'],
      });

      if (myRequest !== this.requestId) return;

      runInAction(() => {
        this.products = res.data;
        this.total = res.meta.pagination.total;
      });
    } catch (e) {
      if (myRequest !== this.requestId) return;

      runInAction(() => {
        this.productsMeta.fail(e);
      });
    } finally {
      if (myRequest === this.requestId) {
        runInAction(() => {
          this.productsMeta.finish();
        });
      }
    }
  }

  async loadCategories() {
    this.categoriesMeta.start();
    try {
      const res = await getProductCategories();

      runInAction(() => {
        this.categories = Array.isArray(res.data) ? res.data : [];
      });
    } catch (e) {
      runInAction(() => {
        this.categoriesMeta.fail(e);
      });
    } finally {
      runInAction(() => {
        this.categoriesMeta.finish();
      });
    }
  }

  get pageCount(): number {
    return this.total > 0 ? Math.ceil(this.total / this.pageSize) : 1;
  }

  get currentPage(): number {
    return Math.min(this.requestedPage, this.pageCount);
  }

  get categoryOptions() {
    return this.categories.map((cat) => {
      const displayName =
        (typeof cat.name === 'string' && cat.name.trim()) ||
        (typeof cat.slug === 'string' && cat.slug.trim()) ||
        `Категория ${cat.id}`;
      return { key: String(cat.id), value: displayName };
    });
  }
}
