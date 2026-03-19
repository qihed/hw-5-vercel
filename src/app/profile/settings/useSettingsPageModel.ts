'use client';

import { useEffect } from 'react';
import { useStore } from 'store/StoreContext';
import { safeParseCards } from './stores/paymentCardsHelpers';
import { safeParseAddresses } from './stores/addressesHelpers';
import type { AddressEntry } from './stores/types';
import { usePaymentCardsStore } from './stores/paymentCardsStore';
import { useAddressesStore } from './stores/addressesStore';

const PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v2';
const LEGACY_PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v1';
const ADDRESSES_STORAGE_KEY = 'profile.addresses.v1';

export function useSettingsPageModel() {
  const { auth } = useStore();

  const payment = usePaymentCardsStore();
  const addresses = useAddressesStore();
  const { hydrateAddresses, addressesMounted, addresses: addressesList } = addresses;

  // Hydrate cards once on mount; persist whenever cards change (after hydration).
  useEffect(() => {
    const rawV2 = localStorage.getItem(PAYMENT_CARDS_STORAGE_KEY);
    const rawV1 = localStorage.getItem(LEGACY_PAYMENT_CARDS_STORAGE_KEY);
    const next = safeParseCards(rawV2 ?? rawV1);
    payment.hydrateCards(next);
    if (!rawV2 && next.length > 0) {
      localStorage.setItem(PAYMENT_CARDS_STORAGE_KEY, JSON.stringify(next));
      localStorage.removeItem(LEGACY_PAYMENT_CARDS_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!payment.mounted) return;
    localStorage.setItem(PAYMENT_CARDS_STORAGE_KEY, JSON.stringify(payment.cards));
  }, [payment.cards, payment.mounted]);

  // Hydrate addresses from localStorage; if list is empty, seed from profile `auth.address`.
  // Re-run when `auth.address` changes to preserve the legacy-migration behavior.
  useEffect(() => {
    if (addressesMounted) return;

    const stored = safeParseAddresses(localStorage.getItem(ADDRESSES_STORAGE_KEY));
    const legacy = (auth.address || '').trim();

    if (stored.length === 0 && legacy) {
      const seed: AddressEntry = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        label: 'Default',
        address: legacy,
        isDefault: true,
        createdAt: Date.now(),
      };
      hydrateAddresses([seed]);
      return;
    }

    const hasDefault = stored.some((a) => a.isDefault);
    const normalized =
      stored.length > 0 && !hasDefault ? [{ ...stored[0], isDefault: true }, ...stored.slice(1)] : stored;
    hydrateAddresses(normalized);
  }, [auth.address, addressesMounted, hydrateAddresses]);

  useEffect(() => {
    if (!addressesMounted) return;
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addressesList));
  }, [addressesList, addressesMounted]);

  return { payment, addresses };
}

