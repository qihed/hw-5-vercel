export type PaymentCard = {
  id: string;
  last4: string;
  expMonth?: string;
  expYear?: string;
  brand?: string;
  isDefault?: boolean;
  createdAt?: number;
};

