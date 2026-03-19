'use client';

import { useCallback, useMemo, useState } from 'react';
import { useStore } from 'store/StoreContext';
import type { AddressEntry } from './types';
import { sortAddresses } from './addressesHelpers';

export type AddressesStore = ReturnType<typeof useAddressesStore>;

export function useAddressesStore() {
  const { auth } = useStore();

  const [addressesMounted, setAddressesMounted] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const sortedAddresses = useMemo(() => {
    return sortAddresses(addresses);
  }, [addresses]);

  const hydrateAddresses = useCallback((next: AddressEntry[]) => {
    setAddresses(next);
    setAddressesMounted(true);
  }, []);

  const startAddAddress = () => {
    setAddressError(null);
    setIsAddingAddress(true);
  };

  const cancelAddAddress = () => {
    setAddressError(null);
    setIsAddingAddress(false);
    setAddressLabel('');
    setAddressText('');
  };

  const onAddressLabelChange = (value: string) => {
    setAddressLabel(value);
  };

  const onAddressTextChange = (value: string) => {
    setAddressText(value);
  };

  const onAddAddress = async () => {
    setAddressError(null);

    const trimmed = addressText.trim();
    if (!trimmed) {
      setAddressError('Please enter an address.');
      return;
    }

    setAddressSubmitting(true);
    try {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      setAddresses((prev) => {
        const next: AddressEntry[] = [
          ...prev.map((a) => ({ ...a, isDefault: prev.some((x) => x.isDefault) ? a.isDefault : false })),
          {
            id,
            label: addressLabel.trim() || undefined,
            address: trimmed,
            isDefault: prev.length === 0,
            createdAt: Date.now(),
          },
        ];
        return next;
      });

      // Keep existing behavior: sync legacy auth.address only when it was empty
      if (addresses.length === 0) {
        auth.setAddress(trimmed);
        auth.saveProfile();
      }

      setAddressLabel('');
      setAddressText('');
      setIsAddingAddress(false);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const onRemoveAddress = (id: string) => {
    setAddresses((prev) => {
      const removed = prev.find((a) => a.id === id);
      const next = prev.filter((a) => a.id !== id);

      if (removed?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }

      const nextDefault = next.find((a) => a.isDefault) ?? next[0];
      auth.setAddress(nextDefault?.address ?? '');
      auth.saveProfile();

      return next;
    });
  };

  const onMakeDefaultAddress = (id: string) => {
    setAddresses((prev) => {
      const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
      const selected = next.find((a) => a.id === id);
      auth.setAddress((selected?.address ?? '').trim());
      auth.saveProfile();
      return next;
    });
  };

  return {
    addressesMounted,
    addresses,
    isAddingAddress,
    addressLabel,
    addressText,
    addressSubmitting,
    addressError,
    sortedAddresses,
    startAddAddress,
    cancelAddAddress,
    onAddressLabelChange,
    onAddressTextChange,
    onAddAddress,
    onRemoveAddress,
    onMakeDefaultAddress,
    hydrateAddresses,
  };
}

