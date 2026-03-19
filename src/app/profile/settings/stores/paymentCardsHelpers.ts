import type { PaymentCard, PaymentCardBrand } from './types';

export function safeParseCards(raw: string | null): PaymentCard[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x): x is PaymentCard => Boolean(x && typeof x === 'object'))
      .map((x) => {
        const card = x as PaymentCard;
        return {
          ...card,
          cardholderName: typeof card.cardholderName === 'string' ? normalizeCardholderName(card.cardholderName) : undefined,
          cvc: typeof card.cvc === 'string' ? normalizeCvc(card.cvc) : undefined,
        };
      })
      .filter((x) => typeof x.id === 'string' && typeof x.last4 === 'string')
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 19);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) groups.push(digits.slice(i, i + 4));
  return groups.join(' ');
}

export function detectBrand(digits: string): PaymentCardBrand {
  if (!digits) return 'unknown';
  if (digits.startsWith('4')) return 'visa';
  if (/^(5[1-5])/.test(digits) || /^(2[2-7])/.test(digits)) return 'mastercard';
  if (/^220[0-4]/.test(digits)) return 'mir';
  if (/^(34|37)/.test(digits)) return 'amex';
  if (/^62/.test(digits)) return 'unionpay';
  return 'unknown';
}

export function normalizeExpMonth(value: string) {
  const digits = digitsOnly(value).slice(0, 2);
  if (!digits) return '';
  const n = Number(digits);
  if (Number.isNaN(n)) return '';
  if (n <= 0) return '01';
  if (n > 12) return '12';
  return String(n).padStart(2, '0');
}

export function normalizeExpYear(value: string) {
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

export function isFutureOrCurrent(month: string, year: string) {
  const mm = Number(month);
  const yy = Number(year);
  if (!mm || !yy) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return yy > y || (yy === y && mm >= m);
}

export function formatExpMmYy(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function parseExpMmYy(value: string): { month: string; year: string } | null {
  const digits = digitsOnly(value);
  if (digits.length < 4) return null;
  const month = normalizeExpMonth(digits.slice(0, 2));
  const year = normalizeExpYear(digits.slice(2, 4));
  if (!month || !year) return null;
  return { month, year };
}

export function normalizeCardholderName(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function isValidCardholderName(value: string) {
  const normalized = normalizeCardholderName(value);
  return Boolean(normalized) && /^[\p{L}\s-]+$/u.test(normalized);
}

export function normalizeCvc(value: string) {
  return digitsOnly(value).slice(0, 4);
}

export function isValidCvc(value: string) {
  return /^\d{3,4}$/.test(value);
}

