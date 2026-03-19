'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import { useStore } from 'store/StoreContext';
import styles from './settings-page.module.scss';
import PaymentCardsSection from './PaymentCardsSection';
import AddressesSection from './AddressesSection';

type PaymentCard = {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand?: 'visa' | 'mastercard' | 'mir' | 'amex' | 'unionpay' | 'unknown';
  isDefault?: boolean;
  createdAt: number;
};

const STORAGE_KEY = 'profile.paymentCards.v1';
const ADDRESSES_STORAGE_KEY = 'profile.addresses.v1';

type AddressEntry = {
  id: string;
  label?: string;
  address: string;
  isDefault?: boolean;
  createdAt: number;
};

function safeParseCards(raw: string | null): PaymentCard[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is PaymentCard => Boolean(x && typeof x === 'object'))
      .map((x) => x as PaymentCard)
      .filter((x) => typeof x.id === 'string' && typeof x.last4 === 'string')
      .slice(0, 20);
  } catch {
    return [];
  }
}

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

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 19);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups.join(' ');
}

function detectBrand(digits: string): PaymentCard['brand'] {
  if (!digits) return 'unknown';
  if (digits.startsWith('4')) return 'visa';
  if (/^(5[1-5])/.test(digits) || /^(2[2-7])/.test(digits)) return 'mastercard';
  if (/^220[0-4]/.test(digits)) return 'mir';
  if (/^(34|37)/.test(digits)) return 'amex';
  if (/^62/.test(digits)) return 'unionpay';
  return 'unknown';
}

function normalizeExpMonth(value: string) {
  const digits = digitsOnly(value).slice(0, 2);
  if (!digits) return '';
  const n = Number(digits);
  if (Number.isNaN(n)) return '';
  if (n <= 0) return '01';
  if (n > 12) return '12';
  return String(n).padStart(2, '0');
}

function normalizeExpYear(value: string) {
  const digits = digitsOnly(value);
  if (digits.length <= 2) {
    if (!digits) return '';
    const yy = Number(digits);
    if (Number.isNaN(yy)) return '';
    const currentYear = new Date().getFullYear();
    const base = Math.floor(currentYear / 100) * 100;
    return String(base + yy);
  }
  return digits.slice(0, 4);
}

function isFutureOrCurrent(month: string, year: string) {
  const mm = Number(month);
  const yy = Number(year);
  if (!mm || !yy) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return yy > y || (yy === y && mm >= m);
}

function formatExpMmYy(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function parseExpMmYy(value: string): { month: string; year: string } | null {
  const digits = digitsOnly(value);
  if (digits.length < 4) return null;
  const month = normalizeExpMonth(digits.slice(0, 2));
  const year = normalizeExpYear(digits.slice(2, 4));
  if (!month || !year) return null;
  return { month, year };
}

const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Settings
      </Text>
      <PaymentCardsSection />
      <AddressesSection />
    </div>
  );

  const formId = useId();
  const { auth } = useStore();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addressesMounted, setAddressesMounted] = useState(false);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCards(safeParseCards(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, mounted]);

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
    const normalized = stored.length > 0 && !hasDefault ? [{ ...stored[0], isDefault: true }, ...stored.slice(1)] : stored;
    setAddresses(normalized);
  }, [auth.address]);

  useEffect(() => {
    if (!addressesMounted) return;
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, addressesMounted]);

  const normalizedDigits = useMemo(() => digitsOnly(cardNumber), [cardNumber]);
  const brand = useMemo(() => detectBrand(normalizedDigits), [normalizedDigits]);
  const canSubmit = useMemo(() => {
    const parsedExp = parseExpMmYy(exp);
    return (
      normalizedDigits.length >= 12 &&
      normalizedDigits.length <= 19 &&
      Boolean(parsedExp) &&
      isFutureOrCurrent(parsedExp!.month, parsedExp!.year)
    );
  }, [exp, normalizedDigits]);

  const brandLabel = useMemo(() => {
    switch (brand) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'Mastercard';
      case 'mir':
        return 'МИР';
      case 'amex':
        return 'AMEX';
      case 'unionpay':
        return 'UnionPay';
      default:
        return 'Card';
    }
  }, [brand]);

  const onAddCard = async () => {
    setError(null);
    if (!canSubmit) {
      setError('Please check card details.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedExp = parseExpMmYy(exp);
      if (!parsedExp) {
        setError('Please check card details.');
        return;
      }

      const last4 = normalizedDigits.slice(-4);
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      setCards((prev) => {
        const next: PaymentCard[] = [
          ...prev.map((c) => ({ ...c, isDefault: prev.some((x) => x.isDefault) ? c.isDefault : false })),
          {
            id,
            last4,
            expMonth: parsedExp.month,
            expYear: parsedExp.year,
            brand,
            isDefault: prev.length === 0,
            createdAt: Date.now(),
          },
        ];
        return next;
      });

      setCardNumber('');
      setExp('');
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  const onRemoveCard = (id: string) => {
    setCards((prev) => {
      const removed = prev.find((c) => c.id === id);
      const next = prev.filter((c) => c.id !== id);
      if (removed?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  };

  const onMakeDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
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

  const sortedAddresses = useMemo(() => {
    return addresses
      .slice()
      .sort(
        (a, b) =>
          Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
          Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      );
  }, [addresses]);

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Settings
      </Text>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderTop}>
            <Text tag="h2" view="p-20" weight="medium">
              Payment cards
            </Text>
            {cards.length > 0 && (
              <button
                type="button"
                className={styles.addIconButton}
                onClick={() => {
                  setError(null);
                  setIsAdding(true);
                }}
                aria-label="Add card"
                title="Add card"
              >
                +
              </button>
            )}
          </div>
          <Text view="p-14" color="secondary">
            Saved locally on this device.
          </Text>
        </div>

        <div className={styles.cardsGrid}>
          {cards.length === 0 ? (
            <div className={styles.emptyState}>
              <Text view="p-16" weight="medium">
                No cards yet
              </Text>
              <Text view="p-14" color="secondary">
                Add a card below to pay faster next time.
              </Text>
            </div>
          ) : (
            cards
              .slice()
              .sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) || b.createdAt - a.createdAt)
              .map((c) => (
                <div key={c.id} className={styles.cardItem}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardBrand}>{(c.brand || 'unknown') === 'unknown' ? 'Card' : c.brand}</div>
                    {c.isDefault && <span className={styles.defaultPill}>Default</span>}
                  </div>

                  <Text view="p-18" weight="medium" className={styles.cardNumber}>
                    •••• •••• •••• {c.last4}
                  </Text>

                  <div className={styles.cardMeta}>
                    <Text view="p-14" color="secondary">
                      {c.expMonth}/{c.expYear.slice(-2)}
                    </Text>
                  </div>

                  <div className={styles.cardActions}>
                    {!c.isDefault && (
                      <button type="button" className={styles.linkButton} onClick={() => onMakeDefault(c.id)}>
                        Make default
                      </button>
                    )}
                    <button type="button" className={styles.linkButtonDanger} onClick={() => onRemoveCard(c.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {(cards.length === 0 || isAdding) && (
          <>
            <div className={styles.divider} />

            <div className={styles.form}>
              <div className={styles.formHeader}>
                <Text tag="h3" view="p-18" weight="medium">
                  Add a new card
                </Text>
                {cards.length > 0 && (
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => {
                      setError(null);
                      setIsAdding(false);
                      setCardNumber('');
                      setExp('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field} htmlFor={`${formId}-number`}>
                  <Text view="p-14" color="secondary" tag="span">
                    Card number
                  </Text>
                  <Input
                    id={`${formId}-number`}
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(v) => setCardNumber(formatCardNumber(v))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    afterSlot={<span className={styles.afterSlot}>{brandLabel}</span>}
                  />
                </label>

                <label className={styles.field} htmlFor={`${formId}-exp`}>
                  <Text view="p-14" color="secondary" tag="span">
                    Expiration (MM/YY)
                  </Text>
                  <Input
                    id={`${formId}-exp`}
                    placeholder="MM/YY"
                    value={exp}
                    onChange={(v) => setExp(formatExpMmYy(v))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </label>
              </div>

              {error && (
                <Text view="p-14" className={styles.errorText}>
                  {error}
                </Text>
              )}

              <div className={styles.formActions}>
                <Button type="button" onClick={onAddCard} loading={submitting} disabled={!canSubmit}>
                  Add card
                </Button>
                {!mounted && (
                  <Text view="p-14" color="secondary">
                    Loading saved cards…
                  </Text>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderTop}>
            <Text tag="h2" view="p-20" weight="medium">
              Addresses
            </Text>
            {addresses.length > 0 && (
              <button
                type="button"
                className={styles.addIconButton}
                onClick={() => {
                  setAddressError(null);
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
                      setAddressError(null);
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
                    onChange={(v) => setAddressLabel(v)}
                    autoComplete="shipping address-level1"
                  />
                </label>

                <label className={styles.field} htmlFor={`${formId}-addr`}>
                  <Text view="p-14" color="secondary" tag="span">
                    Address
                  </Text>
                  <textarea
                    id={`${formId}-addr`}
                    className={styles.textarea}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    rows={3}
                    autoComplete="shipping street-address"
                    placeholder="Street, house, apartment, city"
                  />
                </label>
              </div>

              {addressError && (
                <Text view="p-14" className={styles.errorText}>
                  {addressError}
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
    </div>
  );
};

export default SettingsPage;
