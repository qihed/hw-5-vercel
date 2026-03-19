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
  private pendingDeltas = new Map<number, number>();
  private flushTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private inFlightProducts = new Set<number>();
  private static readonly SYNC_DEBOUNCE_MS = 350;

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
    this.queueServerDelta(productId, quantity);
  }

  async removeItem(productId: number) {
    const existing = this.items.find((i) => i.productId === productId);
    const qty = existing?.quantity ?? 1;
    this.items = this.items.filter((i) => i.productId !== productId);
    this.queueServerDelta(productId, -qty);
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

    this.queueServerDelta(productId, diff);
  }

  async clear() {
    const oldItems = [...this.items];
    this.items = [];
    oldItems.forEach((i) => {
      this.queueServerDelta(i.productId, -i.quantity);
    });
  }

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  }

  getQuantity(productId: number): number {
    const item = this.items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }

  private queueServerDelta(productId: number, delta: number) {
    if (!Number.isFinite(delta) || delta === 0) return;
    const nextDelta = (this.pendingDeltas.get(productId) ?? 0) + delta;
    if (nextDelta === 0) {
      this.pendingDeltas.delete(productId);
    } else {
      this.pendingDeltas.set(productId, nextDelta);
    }
    this.scheduleFlush(productId);
  }

  private scheduleFlush(productId: number) {
    const existingTimer = this.flushTimers.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.flushTimers.delete(productId);
      void this.flushProductDelta(productId);
    }, CartStore.SYNC_DEBOUNCE_MS);
    this.flushTimers.set(productId, timer);
  }

  private async flushProductDelta(productId: number) {
    if (this.inFlightProducts.has(productId)) return;

    const delta = this.pendingDeltas.get(productId) ?? 0;
    if (delta === 0) return;
    this.pendingDeltas.delete(productId);
    this.inFlightProducts.add(productId);

    try {
      if (delta > 0) {
        await addCartItem(productId, delta);
      } else {
        await removeCartItem(productId, Math.abs(delta));
      }
    } catch {
      this.pendingDeltas.delete(productId);
      await this.load();
    } finally {
      this.inFlightProducts.delete(productId);
      if ((this.pendingDeltas.get(productId) ?? 0) !== 0) {
        this.scheduleFlush(productId);
      }
    }
  }
}
