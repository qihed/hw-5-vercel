'use client';

import { useEffect, useRef } from 'react';
import { useStore } from 'store/StoreContext';
import { readOrdersFromStorage } from 'lib/ordersStorage';
import { useOrdersStore } from './stores/ordersStore';
import { consumePostPaymentDeliveryPopupRaw } from './stores/ordersStorage';
import { buildDeliveryAddress, clampDeliveryDays, parseDeliveryPopupPayload } from './stores/ordersHelpers';

export function useOrdersPageModel() {
  const { auth } = useStore();

  const ordersStore = useOrdersStore({ authAddress: auth.address });

  const deliveryPopupConsumedRef = useRef(false);
  const deliveryPopupHadExplicitAddressRef = useRef(false);

  useEffect(() => {
    // Orchestration: read orders from localStorage once.
    ordersStore.hydrateOrders(readOrdersFromStorage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deliveryPopupConsumedRef.current) return;

    const raw = consumePostPaymentDeliveryPopupRaw();
    const parsed = parseDeliveryPopupPayload(raw);
    deliveryPopupConsumedRef.current = true;

    if (!parsed) return;

    deliveryPopupHadExplicitAddressRef.current = Boolean(parsed.address?.trim());

    const days = clampDeliveryDays(parsed.days);
    const address = buildDeliveryAddress(parsed.address, auth.address);

    ordersStore.openDeliveryPopup({
      ...parsed,
      days,
      address,
    });
  }, [auth.address, ordersStore]);

  useEffect(() => {
    // If payload did not include its own address, we can update it once profile address appears.
    if (!ordersStore.deliveryPopup) return;
    if (deliveryPopupHadExplicitAddressRef.current) return;
    if (!auth.address?.trim()) return;

    ordersStore.updateDeliveryPopupAddress(buildDeliveryAddress(undefined, auth.address));
  }, [auth.address, ordersStore]);

  return ordersStore;
}

