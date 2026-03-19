'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Text from 'components/Text';
import Input from 'components/Input';
import Button from 'components/Button';
import CardIcon from 'icons/CardIcon';
import CalendarIcon from 'icons/CalendarIcon';
import { useStore } from 'store/StoreContext';
import styles from './settings-page.module.scss';

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

export default function PaymentCardsSection() {
  const { validation } = useStore();
  const formId = useId();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formKey = 'paymentCards';

  useEffect(() => {
    setMounted(true);
    setCards(safeParseCards(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, mounted]);

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
    validation.clearForm(formKey);
    if (!canSubmit) {
      validation.setFormError(formKey, 'Please check card details.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedExp = parseExpMmYy(exp);
      if (!parsedExp) {
        validation.setFormError(formKey, 'Please check card details.');
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

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderTop}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitleIcon} aria-hidden>
              <CardIcon width={18} height={18} />
            </span>
            <Text tag="h2" view="p-20" weight="medium">
              Payment cards
            </Text>
          </div>
          {cards.length > 0 && (
            <button
              type="button"
              className={styles.addIconButton}
              onClick={() => {
                validation.clearForm(formKey);
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
                    validation.clearForm(formKey);
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
                  onChange={(v) => {
                    validation.clearFormError(formKey);
                    setCardNumber(formatCardNumber(v));
                  }}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  beforeSlot={
                    <span style={{ display: 'inline-flex', color: 'rgba(61, 90, 88, 0.9)' }} aria-hidden>
                      <CardIcon />
                    </span>
                  }
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
                  onChange={(v) => {
                    validation.clearFormError(formKey);
                    setExp(formatExpMmYy(v));
                  }}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  beforeSlot={
                    <span style={{ display: 'inline-flex', color: 'rgba(61, 90, 88, 0.9)' }} aria-hidden>
                      <CalendarIcon />
                    </span>
                  }
                />
              </label>
            </div>

            {validation.getFormError(formKey) && (
              <Text view="p-14" className={styles.errorText}>
                {validation.getFormError(formKey)}
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
  );
}

