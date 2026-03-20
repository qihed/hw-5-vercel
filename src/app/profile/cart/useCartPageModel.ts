'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStore } from 'store/StoreContext';
import { getProducts } from 'api/products';
import type { Product } from 'api/types';
import { appendOrderToStorage, readOrdersFromStorage, type Order } from 'lib/ordersStorage';
import { useCartPageStore } from './stores/cartStore';
import {
  safeReadPaymentCards,
  safeReadDeliveryAddresses,
  sleep,
  buildOrderItems,
  POSTPAYMENT_POPUP_STORAGE_KEY,
} from './stores/cartHelpers';

function isSameProductsMap(
  current: Record<number, Product>,
  next: Record<number, Product>,
  ids: number[]
) {
  if (Object.keys(current).length !== Object.keys(next).length) return false;
  for (const id of ids) {
    if (current[id] !== next[id]) return false;
  }
  return true;
}

export function useCartPageModel() {
  const router = useRouter();
  const { cart, auth } = useStore();

  const store = useCartPageStore();

  const {
    items,
    products,
    paymentModal,
    resetProducts,
    setProductsLoading,
    hydrateProducts,
    hydratePaymentCards,
    hydrateAddresses,
    setPayError,
    setPaying,
    setCheckingOut,
    closePayModal,
    subtotal,
  } = store;

  const productIdsKey = useMemo(() => items.map((i) => i.productId).join(','), [items]);

  // Hydrate products when cart items change.
  useEffect(() => {
    if (items.length === 0) {
      resetProducts();
      return;
    }

    const ids = items.map((item) => item.productId);
    const idSet = new Set(ids);
    const prunedProducts = Object.fromEntries(
      Object.entries(products).filter(([id]) => idSet.has(Number(id)))
    ) as Record<number, Product>;
    const missingIds = ids.filter((id) => prunedProducts[id] == null);

    // Keep UI stable on quantity/remove changes: only fetch truly missing products.
    if (missingIds.length === 0) {
      if (isSameProductsMap(products, prunedProducts, ids)) return;
      hydrateProducts(prunedProducts);
      return;
    }

    setProductsLoading(Object.keys(prunedProducts).length === 0);

    getProducts({ productIds: missingIds, pageSize: missingIds.length })
      .then((res) => {
        const map: Record<number, Product> = {};
        res.data.forEach((p) => {
          map[p.id] = p;
        });
        hydrateProducts({ ...prunedProducts, ...map });
      })
      .catch(() => {
        hydrateProducts(prunedProducts);
      });
  }, [productIdsKey, items, products, hydrateProducts, resetProducts, setProductsLoading]);

  // Hydrate saved cards and delivery addresses when the payment modal opens.
  useEffect(() => {
    if (!paymentModal.isOpen) return;

    hydratePaymentCards(safeReadPaymentCards());
    hydrateAddresses(safeReadDeliveryAddresses((auth.address || '').trim()));
  }, [paymentModal.isOpen, hydratePaymentCards, hydrateAddresses, auth.address]);

  const handlePay = useCallback(async () => {
    setPayError(null);

    const selectedCardId = paymentModal.selectedCardId;
    if (!selectedCardId) {
      setPayError('Select a card to continue.');
      return;
    }

    const trimmedManual = paymentModal.manualAddress.trim();
    const fromList =
      paymentModal.addresses.length > 0
        ? paymentModal.addresses.find((a) => a.id === paymentModal.selectedAddressId)?.address?.trim() ?? ''
        : '';
    const deliveryAddress = paymentModal.addresses.length > 0 ? fromList : trimmedManual;
    if (!deliveryAddress) {
      setPayError('Enter a delivery address to continue.');
      return;
    }

    setPaying(true);
    setCheckingOut(true);
    try {
      await sleep(900);

      const ok = Math.random() < 0.9;
      if (!ok) {
        setPayError('Payment failed. Please try again.');
        return;
      }

      const orderItems = buildOrderItems(items, products);

      const existing = readOrdersFromStorage();
      const nextId = existing.length > 0 ? Math.max(...existing.map((o) => o.id)) + 1 : 1;

      const order: Order = {
        id: nextId,
        status: 'processing',
        statusLabel: 'Processing',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        total: subtotal,
        items: orderItems,
      };

      appendOrderToStorage(order);

      if (typeof window !== 'undefined') {
        const days = 5 + Math.floor(Math.random() * 3);
        window.localStorage.setItem(
          POSTPAYMENT_POPUP_STORAGE_KEY,
          JSON.stringify({
            days,
            address: deliveryAddress,
            orderId: order.id,
            createdAt: Date.now(),
          })
        );
      }

      await cart.clear();
      closePayModal();

      toast.success('Payment was successful.');
      router.push('/profile/orders');
    } finally {
      setPaying(false);
      setCheckingOut(false);
    }
  }, [
    cart,
    router,
    paymentModal.selectedCardId,
    paymentModal.addresses,
    paymentModal.selectedAddressId,
    paymentModal.manualAddress,
    items,
    products,
    closePayModal,
    setPayError,
    setPaying,
    setCheckingOut,
    subtotal,
  ]);

  return {
    ...store,
    handlePay,
    payOpen: store.paymentModal.isOpen,
    paying: store.paymentModal.paying,
    checkingOut: store.paymentModal.checkingOut,
    payError: store.paymentModal.payError,
    selectedCardId: store.paymentModal.selectedCardId,
    selectedAddressId: store.paymentModal.selectedAddressId,
    manualAddress: store.paymentModal.manualAddress,
  };
}

