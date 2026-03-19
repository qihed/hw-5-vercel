'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import { useStore } from 'store/StoreContext';
import TagIcon from 'icons/TagIcon';
import PinIcon from 'icons/PinIcon';
import styles from './settings-page.module.scss';

type AddressEntry = {
  id: string;
  label?: string;
  address: string;
  isDefault?: boolean;
  createdAt: number;
};

const ADDRESSES_STORAGE_KEY = 'profile.addresses.v1';

function safeParseAddresses(raw: string | null): AddressEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is AddressEntry => Boolean(x && typeof x === 'object'))
      .map((x) => x as AddressEntry)
      .filter((x) => typeof x.id === 'string' && typeof x.address === 'string')
      .map((x) => ({
        ...x,
        address: String(x.address ?? '').trim(),
        label: typeof x.label === 'string' ? x.label.trim() : undefined,
        createdAt: typeof x.createdAt === 'number' ? x.createdAt : Date.now(),
      }))
      .filter((x) => x.address.length > 0)
      .slice(0, 20);
  } catch {
    return [];
  }
}

export default function AddressesSection() {
  const { auth } = useStore();
  const { validation } = useStore();
  const formId = useId();
  const formKey = 'addresses';

  const [addressesMounted, setAddressesMounted] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  useEffect(() => {
    setAddressesMounted(true);
    const stored = safeParseAddresses(localStorage.getItem(ADDRESSES_STORAGE_KEY));

    // Migration: seed from profile address if no list exists yet
    const legacy = (auth.address || '').trim();
    if (stored.length === 0 && legacy) {
      const seed: AddressEntry = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        label: 'Default',
        address: legacy,
        isDefault: true,
        createdAt: Date.now(),
      };
      setAddresses([seed]);
      return;
    }

    // Ensure we always have one default if list not empty
    const hasDefault = stored.some((a) => a.isDefault);
    const normalized =
      stored.length > 0 && !hasDefault ? [{ ...stored[0], isDefault: true }, ...stored.slice(1)] : stored;
    setAddresses(normalized);
  }, [auth.address]);

  useEffect(() => {
    if (!addressesMounted) return;
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, addressesMounted]);

  const sortedAddresses = useMemo(() => {
    return addresses
      .slice()
      .sort(
        (a, b) =>
          Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
          Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      );
  }, [addresses]);

  const onAddAddress = async () => {
    validation.clearForm(formKey);
    const trimmed = addressText.trim();
    if (!trimmed) {
      validation.setFieldError(formKey, 'address', 'Please enter an address.');
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

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderTop}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitleIcon} aria-hidden>
              <PinIcon width={18} height={18} />
            </span>
            <Text tag="h2" view="p-20" weight="medium">
              Addresses
            </Text>
          </div>
          {addresses.length > 0 && (
            <button
              type="button"
              className={styles.addIconButton}
              onClick={() => {
                validation.clearForm(formKey);
                setIsAddingAddress(true);
              }}
              aria-label="Add address"
              title="Add address"
            >
              +
            </button>
          )}
        </div>
        <Text view="p-14" color="secondary">
          Used for delivery and order details.
        </Text>
      </div>

      <div className={styles.cardsGrid}>
        {addresses.length === 0 ? (
          <div className={styles.emptyState}>
            <Text view="p-16" weight="medium">
              No addresses yet
            </Text>
            <Text view="p-14" color="secondary">
              Add an address below to checkout faster next time.
            </Text>
          </div>
        ) : (
          sortedAddresses.map((a) => (
            <div key={a.id} className={styles.cardItem}>
              <div className={styles.cardTop}>
                <div className={styles.cardBrand}>{a.label?.trim() ? a.label : 'Address'}</div>
                {a.isDefault && <span className={styles.defaultPill}>Default</span>}
              </div>

              <Text view="p-16" weight="medium" className={styles.addressText}>
                {a.address}
              </Text>

              <div className={styles.cardActions}>
                {!a.isDefault && (
                  <button type="button" className={styles.linkButton} onClick={() => onMakeDefaultAddress(a.id)}>
                    Make default
                  </button>
                )}
                <button type="button" className={styles.linkButtonDanger} onClick={() => onRemoveAddress(a.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {(addresses.length === 0 || isAddingAddress) && (
        <>
          <div className={styles.divider} />

          <div className={styles.form}>
            <div className={styles.formHeader}>
              <Text tag="h3" view="p-18" weight="medium">
                Add a new address
              </Text>
              {addresses.length > 0 && (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    validation.clearForm(formKey);
                    setIsAddingAddress(false);
                    setAddressLabel('');
                    setAddressText('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field} htmlFor={`${formId}-addr-label`}>
                <Text view="p-14" color="secondary" tag="span">
                  Label (optional)
                </Text>
                <Input
                  id={`${formId}-addr-label`}
                  placeholder="Home / Office"
                  value={addressLabel}
                  onChange={(v) => {
                    validation.clearFormError(formKey);
                    setAddressLabel(v);
                  }}
                  autoComplete="shipping address-level1"
                    beforeSlot={
                      <span style={{ display: 'inline-flex', color: 'rgba(61, 90, 88, 0.9)' }} aria-hidden>
                        <TagIcon />
                      </span>
                    }
                />
              </label>

              <label className={styles.field} htmlFor={`${formId}-addr`}>
                <Text view="p-14" color="secondary" tag="span">
                  Address
                </Text>
                <div className={styles.textareaWrapper}>
                  <div className={styles.textareaIcon} aria-hidden>
                    <PinIcon />
                  </div>
                  <textarea
                    id={`${formId}-addr`}
                    className={styles.textareaInput}
                    value={addressText}
                    onChange={(e) => {
                      validation.clearFieldError(formKey, 'address');
                      validation.clearFormError(formKey);
                      setAddressText(e.target.value);
                    }}
                    rows={3}
                    autoComplete="shipping street-address"
                    placeholder="Street, house, apartment, city"
                  />
                </div>
              </label>
            </div>

            {validation.getFieldError(formKey, 'address') && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFieldError(formKey, 'address')}
              </Text>
            )}

            <div className={styles.formActions}>
              <Button type="button" onClick={onAddAddress} loading={addressSubmitting}>
                Add address
              </Button>
              {!addressesMounted && (
                <Text view="p-14" color="secondary">
                  Loading saved addresses…
                </Text>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

