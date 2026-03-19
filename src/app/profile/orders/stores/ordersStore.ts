'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Order } from 'lib/ordersStorage';
import { removeOrderFromStorage } from 'lib/ordersStorage';
import type { DeliveryPopupPayload } from './types';
import { getDeliveryDaysSuffix } from './ordersHelpers';

export type DeliveryPopup = {
  days: number;
  orderId: number | null;
  address: string;
};

export type OrdersStore = ReturnType<typeof useOrdersStore>;

export function useOrdersStore({ authAddress }: { authAddress: string | undefined }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // null means popup is closed / not scheduled.
  const [deliveryPopup, setDeliveryPopup] = useState<DeliveryPopup | null>(null);

  const hasProfileAddress = useMemo(() => Boolean(authAddress?.trim()), [authAddress]);
  const deliveryDaysSuffix = useMemo(() => {
    if (!deliveryPopup) return '';
    return getDeliveryDaysSuffix(deliveryPopup.days);
  }, [deliveryPopup]);

  const hydrateOrders = useCallback((nextOrders: Order[]) => {
    setOrders(nextOrders);
    setOrdersLoaded(true);
  }, []);

  const openDeliveryPopup = useCallback((payload: DeliveryPopupPayload & { days: number; address: string }) => {
    // payload is already validated/normalized in orchestration layer.
    setDeliveryPopup({
      days: payload.days,
      orderId: typeof payload.orderId === 'number' ? payload.orderId : null,
      address: payload.address,
    });
  }, []);

  const closeDeliveryPopup = useCallback(() => {
    setDeliveryPopup(null);
  }, []);

  const updateDeliveryPopupAddress = useCallback((address: string) => {
    setDeliveryPopup((prev) => (prev ? { ...prev, address } : prev));
  }, []);

  const removeOrder = useCallback(
    (orderId: number) => {
      removeOrderFromStorage(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    },
    []
  );

  return {
    orders,
    ordersLoaded,
    deliveryPopup,
    hasProfileAddress,
    deliveryDaysSuffix,
    hydrateOrders,
    openDeliveryPopup,
    closeDeliveryPopup,
    updateDeliveryPopupAddress,
    removeOrder,
  };
}

export type OrdersPageStore = ReturnType<typeof useOrdersStore>;

