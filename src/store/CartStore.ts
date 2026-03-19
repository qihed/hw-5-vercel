import { makeAutoObservable, runInAction } from 'mobx';
import type { CartItem } from 'api/types';
import { fetchCartRaw, addCartItem, removeCartItem } from 'api/cart';

type RawCartItem = { product: { id?: number } | number; quantity?: number };

function parseCartResponse(data: unknown): CartItem[] {
  const raw: unknown[] = Array.isArray(data) ? data : Array.isArray((data as { data?: unknown[] })?.data) ? (data as { data: unknown[] }).data : [];
  const list = (raw as RawCartItem[])
    .map((item) => ({
      productId: typeof item.product === 'object' ? (item.product.id ?? 0) : item.product,
      quantity: item.quantity ?? 1,
    }))
    .filter((item) => item.productId > 0);

  const aggregated = new Map<number, number>();
  for (const item of list) {
    aggregated.set(item.productId, (aggregated.get(item.productId) ?? 0) + (item.quantity ?? 1));
  }

  return Array.from(aggregated.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

export class CartStore {
  items: CartItem[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.loading = true;
    try {
      const data = await fetchCartRaw();
      const items = parseCartResponse(data);
      runInAction(() => {
        this.items = items;
        this.loading = false;
      });
    } catch {
      runInAction(() => { this.loading = false; });
    }
  }

  async addItem(productId: number, quantity = 1) {
    const existing = this.items.find((i) => i.productId === productId);
    const newQty = (existing?.quantity ?? 0) + quantity;
    if (existing) {
      this.items = this.items.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      );
    } else {
      this.items = [...this.items, { productId, quantity }];
    }
    try {
      await addCartItem(productId, quantity);
    } catch {
      await this.load();
    }
  }

  async removeItem(productId: number) {
    const existing = this.items.find((i) => i.productId === productId);
    const qty = existing?.quantity ?? 1;
    this.items = this.items.filter((i) => i.productId !== productId);
    try {
      await removeCartItem(productId, qty);
    } catch {
      await this.load();
    }
  }

  async setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      await this.removeItem(productId);
      return;
    }
    const existing = this.items.find((i) => i.productId === productId);
    const currentQty = existing?.quantity ?? 0;
    const diff = quantity - currentQty;

    this.items = this.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    if (!existing) {
      this.items = [...this.items, { productId, quantity }];
    }

    try {
      if (diff > 0) {
        await addCartItem(productId, diff);
      } else if (diff < 0) {
        await removeCartItem(productId, Math.abs(diff));
      }
    } catch {
      await this.load();
    }
  }

  async clear() {
    const oldItems = [...this.items];
    this.items = [];
    try {
      await Promise.all(oldItems.map((i) => removeCartItem(i.productId, i.quantity)));
    } catch {
      await this.load();
    }
  }

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  }

  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }
}
