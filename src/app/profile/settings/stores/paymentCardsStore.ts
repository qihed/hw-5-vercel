'use client';

import { useMemo, useState } from 'react';
import type { PaymentCard } from './types';
import {
  detectBrand,
  formatCardNumber,
  formatExpMmYy,
  isFutureOrCurrent,
  isValidCardholderName,
  isValidCvc,
  normalizeCardholderName,
  normalizeCvc,
  parseExpMmYy,
  digitsOnly,
} from './paymentCardsHelpers';

export type PaymentCardsStore = ReturnType<typeof usePaymentCardsStore>;

export function usePaymentCardsStore() {
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cvc, setCvc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrateCards = (nextCards: PaymentCard[]) => {
    setCards(nextCards);
    setMounted(true);
  };

  const normalizedDigits = useMemo(() => digitsOnly(cardNumber), [cardNumber]);
  const brand = useMemo(() => detectBrand(normalizedDigits), [normalizedDigits]);

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

  const canSubmit = useMemo(() => {
    const parsedExp = parseExpMmYy(exp);
    return (
      normalizedDigits.length >= 12 &&
      normalizedDigits.length <= 19 &&
      Boolean(parsedExp) &&
      isFutureOrCurrent(parsedExp!.month, parsedExp!.year) &&
      isValidCardholderName(cardholderName) &&
      isValidCvc(cvc)
    );
  }, [exp, normalizedDigits, cardholderName, cvc]);

  const startAddCard = () => {
    setError(null);
    setIsAdding(true);
  };

  const cancelAddCard = () => {
    setError(null);
    setIsAdding(false);
    setCardNumber('');
    setExp('');
    setCardholderName('');
    setCvc('');
  };

  const onCardNumberChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
  };

  const onExpChange = (value: string) => {
    setExp(formatExpMmYy(value));
  };

  const onCardholderNameChange = (value: string) => {
    setCardholderName(value);
  };

  const onCvcChange = (value: string) => {
    setCvc(normalizeCvc(value));
  };

  const onAddCard = async () => {
    setError(null);
    if (!canSubmit) {
      setError('Please check card details.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedExp = parseExpMmYy(exp);
      const normalizedName = normalizeCardholderName(cardholderName);
      const normalizedCvc = normalizeCvc(cvc);
      if (!parsedExp) {
        setError('Please check card details.');
        return;
      }
      if (!isValidCardholderName(normalizedName) || !isValidCvc(normalizedCvc)) {
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
            cardholderName: normalizedName,
            cvc: normalizedCvc,
            createdAt: Date.now(),
          },
        ];
        return next;
      });

      setCardNumber('');
      setExp('');
      setCardholderName('');
      setCvc('');
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

  return {
    mounted,
    cards,
    isAdding,
    cardNumber,
    exp,
    cardholderName,
    cvc,
    submitting,
    error,
    canSubmit,
    brandLabel,
    startAddCard,
    cancelAddCard,
    onCardNumberChange,
    onExpChange,
    onCardholderNameChange,
    onCvcChange,
    onAddCard,
    onRemoveCard,
    onMakeDefault,
    hydrateCards,
  };
}

