import type { DeliveryPopupPayload } from './types';

export function parseDeliveryPopupPayload(raw: string | null): DeliveryPopupPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const p = parsed as Partial<DeliveryPopupPayload>;
    const days = typeof p.days === 'number' ? p.days : 5;

    const address = typeof p.address === 'string' ? p.address : undefined;
    const orderId = typeof p.orderId === 'number' ? p.orderId : undefined;
    const createdAt = typeof p.createdAt === 'number' ? p.createdAt : undefined;

    return { days, address, orderId, createdAt };
  } catch {
    return null;
  }
}

export function clampDeliveryDays(days: number) {
  return days >= 5 && days <= 7 ? days : 5;
}

export function buildDeliveryAddress(addressFromPayload: string | undefined, authAddress: string | undefined) {
  return (addressFromPayload || authAddress || '').trim();
}

export function getDeliveryDaysSuffix(days: number) {
  return days === 1 ? 'day' : 'days';
}

