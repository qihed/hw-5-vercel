export type PaymentCardBrand = 'visa' | 'mastercard' | 'mir' | 'amex' | 'unionpay' | 'unknown';

export type PaymentCard = {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand?: PaymentCardBrand;
  isDefault?: boolean;
  cardholderName?: string;
  cvc?: string;
  createdAt: number;
};

export type AddressEntry = {
  id: string;
  label?: string;
  address: string;
  isDefault?: boolean;
  createdAt: number;
};

