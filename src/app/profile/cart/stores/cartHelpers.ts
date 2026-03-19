import type { CartItem, Product } from 'api/types';
import type { OrderItem } from 'lib/ordersStorage';
import type { PaymentCard } from './types';
import { DEFAULT_PRODUCT_IMAGE, getProductCategoryName, getProductImageUrl } from 'api/products';

export const PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v1';
export const POSTPAYMENT_POPUP_STORAGE_KEY = 'postPayment.deliveryPopup.v1';

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function safeReadPaymentCards(): PaymentCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PAYMENT_CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is PaymentCard => Boolean(x && typeof x === 'object'))
      .map((x) => x as PaymentCard)
      .filter((c) => typeof c.id === 'string' && typeof c.last4 === 'string')
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function calculateSubtotal(items: CartItem[], products: Record<number, Product>) {
  return items.reduce((sum, item) => {
    const product = products[item.productId];
    const price = product?.price ?? 0;
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);
}

export function buildCartShareText(items: CartItem[], origin?: string) {
  if (items.length === 0) return '';
  const o = origin ?? '';
  const lines = items.map((item) => {
    const productUrl = o ? `${o}/products/${item.productId}` : `/products/${item.productId}`;
    return productUrl;
  });

  return `Look at what I have in my cart:\n${lines.join('\n')}`;
}

export function sortCards(cards: PaymentCard[]) {
  return cards
    .slice()
    .sort(
      (a, b) =>
        Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
        Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
    );
}

export type CartLine = {
  productId: number;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  totalPrice: number;
};

export function buildCartLines(items: CartItem[], products: Record<number, Product>): CartLine[] {
  return items.map((item) => {
    const product = products[item.productId];
    const imageUrl = product ? getProductImageUrl(product) ?? DEFAULT_PRODUCT_IMAGE : DEFAULT_PRODUCT_IMAGE;
    const name = product?.title ?? `Product ${item.productId}`;
    const category = product ? getProductCategoryName(product) : '';
    const price = product?.price ?? 0;
    const qty = item.quantity ?? 1;
    const totalPrice = price * qty;
    return { productId: item.productId, imageUrl, name, category, price, qty, totalPrice };
  });
}

export function buildOrderItems(items: CartItem[], products: Record<number, Product>): OrderItem[] {
  return items.map((item) => {
    const product = products[item.productId];
    const price = product?.price ?? 0;
    const qty = item.quantity ?? 1;
    return {
      name: product?.title ?? `Product ${item.productId}`,
      quantity: qty,
      price,
      image: product ? getProductImageUrl(product) ?? '' : '',
    };
  });
}

