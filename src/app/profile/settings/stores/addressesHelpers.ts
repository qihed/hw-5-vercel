import type { AddressEntry } from './types';

export function safeParseAddresses(raw: string | null): AddressEntry[] {
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

export function sortAddresses(addresses: AddressEntry[]) {
  return addresses
    .slice()
    .sort(
      (a, b) =>
        Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
        Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
    );
}

