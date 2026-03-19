'use client';

import { useCallback, useMemo, useState } from 'react';
import { useStore } from 'store/StoreContext';
import type { Product } from 'api/types';
import {
  calculateSubtotal,
  buildCartLines,
  buildCartShareText,
  sortCards,
} from './cartHelpers';
import type { PaymentCard } from './types';

export type PaymentModal = {
  isOpen: boolean;
  cards: PaymentCard[];
  selectedCardId: string;
  paying: boolean;
  checkingOut: boolean;
  payError: string | null;
};

export type CartPageStore = ReturnType<typeof useCartPageStore>;

export function useCartPageStore() {
  const { cart } = useStore();

  const items = cart.items;

  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [paymentModal, setPaymentModal] = useState<PaymentModal>({
    isOpen: false,
    cards: [],
    selectedCardId: '',
    paying: false,
    checkingOut: false,
    payError: null,
  });

  const subtotal = useMemo(() => calculateSubtotal(items, products), [items, products]);
  const cartLines = useMemo(() => buildCartLines(items, products), [items, products]);
  // `hydratePaymentCards` already sorts and stores the sorted array in `paymentModal.cards`.
  // We expose it as-is to avoid sorting twice.
  const sortedCards = paymentModal.cards;

  const cartOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = useMemo(() => buildCartShareText(items, cartOrigin), [items, cartOrigin]);

  const openPayModal = useCallback(() => {
    if (items.length === 0) return;
    if (loadingProducts) return;
    if (paymentModal.checkingOut || paymentModal.paying) return;

    setPaymentModal((prev) => ({
      ...prev,
      isOpen: true,
      payError: null,
      paying: false,
      checkingOut: false,
    }));
  }, [items.length, loadingProducts, paymentModal.checkingOut, paymentModal.paying]);

  const closePayModal = useCallback(() => {
    setPaymentModal((prev) => ({
      ...prev,
      isOpen: false,
      payError: null,
      paying: false,
      checkingOut: false,
    }));
  }, []);

  const hydratePaymentCards = useCallback((cards: PaymentCard[]) => {
    const sorted = sortCards(cards);
    const defaultCard = sorted.find((c) => c.isDefault) ?? sorted[0];
    setPaymentModal((prev) => ({
      ...prev,
      cards: sorted,
      selectedCardId: defaultCard?.id ?? '',
      payError: null,
    }));
  }, []);

  const selectCard = useCallback((id: string) => {
    setPaymentModal((prev) => ({ ...prev, selectedCardId: id }));
  }, []);

  const setPayError = useCallback((msg: string | null) => {
    setPaymentModal((prev) => ({ ...prev, payError: msg }));
  }, []);

  const setPaying = useCallback((value: boolean) => {
    setPaymentModal((prev) => ({ ...prev, paying: value }));
  }, []);

  const setCheckingOut = useCallback((value: boolean) => {
    setPaymentModal((prev) => ({ ...prev, checkingOut: value }));
  }, []);

  const hydrateProducts = useCallback((next: Record<number, Product>) => {
    setProducts((prev) => (prev === next ? prev : next));
    setLoadingProducts(false);
  }, []);

  const resetProducts = useCallback(() => {
    setProducts((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setLoadingProducts((prev) => (prev ? false : prev));
  }, []);

  const setProductsLoading = useCallback((value: boolean) => {
    setLoadingProducts(value);
  }, []);

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      cart.setQuantity(productId, quantity);
    },
    [cart]
  );

  const addItem = useCallback(
    (productId: number, quantity: number) => {
      cart.addItem(productId, quantity);
    },
    [cart]
  );

  const removeItem = useCallback(
    (productId: number) => {
      cart.removeItem(productId);
    },
    [cart]
  );

  // This store is intentionally "model-only": it does not perform IO.
  return {
    items,
    products,
    loadingProducts,
    subtotal,
    cartLines,
    shareText,
    sortedCards,
    paymentModal,
    openPayModal,
    closePayModal,
    selectCard,
    hydratePaymentCards,
    setPayError,
    setPaying,
    setCheckingOut,
    hydrateProducts,
    resetProducts,
    setProductsLoading,
    setQuantity,
    addItem,
    removeItem,
  };
}

