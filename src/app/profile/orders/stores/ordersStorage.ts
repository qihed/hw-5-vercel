export const POSTPAYMENT_POPUP_STORAGE_KEY = 'postPayment.deliveryPopup.v1';

export function consumePostPaymentDeliveryPopupRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(POSTPAYMENT_POPUP_STORAGE_KEY);
    window.localStorage.removeItem(POSTPAYMENT_POPUP_STORAGE_KEY);
    return raw;
  } catch {
    return null;
  }
}

