'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import Text from 'components/Text';
import Button from 'components/Button';
import { useStore } from 'store/StoreContext';
import { getProducts, getProductImageUrl, getProductCategoryName, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import type { Product } from 'api/types';
import { appendOrderToStorage, readOrdersFromStorage, type Order } from 'lib/ordersStorage';
import styles from './cart-page.module.scss';
import { toast } from 'sonner';
import ShareButton from 'components/ShareButton';

type PaymentCard = {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand?: string;
  isDefault?: boolean;
  createdAt?: number;
};

const PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v1';
const POSTPAYMENT_POPUP_STORAGE_KEY = 'postPayment.deliveryPopup.v1';

function safeReadPaymentCards(): PaymentCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PAYMENT_CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is PaymentCard => Boolean(x && typeof x === 'object'))
      .map((x) => x as PaymentCard)
      .filter((c) => typeof c.id === 'string' && typeof c.last4 === 'string')
      .slice(0, 20);
  } catch {
    return [];
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ProfileCartPage = () => {
  const router = useRouter();
  const { cart, auth } = useStore();
  const items = cart.items;
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) {
      queueMicrotask(() => {
        setProducts({});
        setLoading(false);
      });
      return;
    }

    const ids = items.map((item) => item.productId);
    getProducts({ productIds: ids, pageSize: ids.length })
      .then((res) => {
        const map: Record<number, Product> = {};
        res.data.forEach((p) => {
          map[p.id] = p;
        });
        setProducts(map);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [items]);

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const product = products[item.productId];
      const price = product?.price ?? 0;
      return sum + price * (item.quantity ?? 1);
    }, 0);
  };

  const subtotal = getSubtotal();

  const buildCartShareText = () => {
    if (items.length === 0) return '';

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const lines = items.map((item) => {
      const productUrl = origin ? `${origin}/products/${item.productId}` : `/products/${item.productId}`;
      return `${productUrl}`;
    });

    return `Look at what I have in my cart:\n${lines.join('\n')}`;
  };

  const sortedCards = useMemo(() => {
    return cards
      .slice()
      .sort(
        (a, b) =>
          Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
          Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      );
  }, [cards]);

  const payPreview = useMemo(() => {
    if (items.length === 0) return null;
    const first = items[0];
    const p = products[first.productId];
    const imageUrl = p ? getProductImageUrl(p) ?? DEFAULT_PRODUCT_IMAGE : DEFAULT_PRODUCT_IMAGE;
    const title = p?.title ?? `Product ${first.productId}`;
    const restCount = Math.max(0, items.length - 1);
    const qty = first.quantity ?? 1;
    return { imageUrl, title, qty, restCount };
  }, [items, products]);

  useEffect(() => {
    if (!payOpen) return;
    setPayError(null);
    const nextCards = safeReadPaymentCards();
    setCards(nextCards);
    const defaultCard = nextCards.find((c) => c.isDefault) ?? nextCards[0];
    setSelectedCardId(defaultCard?.id ?? '');
  }, [payOpen]);

  const handleCheckout = () => {
    if (items.length === 0 || loading || checkingOut) return;
    setPayOpen(true);
  };

  const handlePay = async () => {
    setPayError(null);
    if (!selectedCardId) {
      setPayError('Select a card to continue.');
      return;
    }

    setPaying(true);
    setCheckingOut(true);
    try {
      await wait(900);
      const ok = Math.random() < 0.9;
      if (!ok) {
        setPayError('Payment failed. Please try again.');
        return;
      }

      const orderItems = items.map((item) => {
        const product = products[item.productId];
        const price = product?.price ?? 0;
        const qty = item.quantity ?? 1;
        return {
          name: product?.title ?? `Product ${item.productId}`,
          quantity: qty,
          price,
          image: product ? getProductImageUrl(product) ?? '' : '',
        };
      });
      const existing = readOrdersFromStorage();
      const nextId = existing.length > 0 ? Math.max(...existing.map((o) => o.id)) + 1 : 1;
      const order: Order = {
        id: nextId,
        status: 'processing',
        statusLabel: 'Processing',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        total: subtotal,
        items: orderItems,
      };
      appendOrderToStorage(order);

      if (typeof window !== 'undefined') {
        const days = 5 + Math.floor(Math.random() * 3);
        const address = (auth.address || '').trim();
        window.localStorage.setItem(
          POSTPAYMENT_POPUP_STORAGE_KEY,
          JSON.stringify({
            days,
            address,
            orderId: order.id,
            createdAt: Date.now(),
          })
        );
      }

      await cart.clear();
      setPayOpen(false);
      toast.success('Payment was successful.');
      router.push('/profile/orders');
    } finally {
      setPaying(false);
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <Text view="title" tag="h1" className={styles.title}>
          Cart
        </Text>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 6h15l-1.4 7.2a2 2 0 0 1-2 1.6H8a2 2 0 0 1-2-1.6L4.6 3.5A2 2 0 0 0 2.7 2H2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 21Z"
                fill="currentColor"
              />
              <path
                d="M18 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 18 21Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.emptyText}>
            <Text view="p-20" weight="bold" tag="p" className={styles.emptyTitle}>
              Your cart is empty
            </Text>
            <Text view="p-16" color="secondary" tag="p" className={styles.emptySubtitle}>
              Add items from the catalog — they&apos;ll appear here.
            </Text>
          </div>
          <div className={styles.emptyActions}>
            <Link href="/products" className={styles.backLink}>
              <Button type="button" className={styles.emptyCta}>
                Browse products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Cart
      </Text>

      {loading ? (
        <Text view="p-16" color="secondary">
          Loading...
        </Text>
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.cartItems}>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const product = products[item.productId];
                const imageUrl = product ? getProductImageUrl(product) ?? DEFAULT_PRODUCT_IMAGE : DEFAULT_PRODUCT_IMAGE;
                const name = product?.title ?? `Product ${item.productId}`;
                const category = product ? getProductCategoryName(product) : '';
                const price = product?.price ?? 0;
                const qty = item.quantity ?? 1;
                const totalPrice = price * qty;

                return (
                  <motion.div
                    key={item.productId}
                    className={styles.cartItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    layout
                  >
                  <div className={styles.itemImageWrap}>
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="80px"
                      className={styles.itemImage}
                    />
                  </div>

                  <div className={styles.itemDetails}>
                    <Text view="p-16" weight="medium">
                      {name}
                    </Text>
                    {category && (
                      <Text view="p-14" color="secondary">
                        {category}
                      </Text>
                    )}
                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => cart.setQuantity(item.productId, qty - 1)}
                      >
                        −
                      </button>
                      <motion.span
                        key={qty}
                        className={styles.qtyValue}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                      >
                        {qty}
                      </motion.span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => cart.addItem(item.productId, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => cart.removeItem(item.productId)}
                        aria-label="Remove"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemPricing}>
                    <Text view="p-18" weight="bold">
                      {totalPrice.toFixed(2)} ₽
                    </Text>
                    {qty > 1 && (
                      <Text view="p-14" color="secondary">
                        {price.toFixed(2)} ₽ each
                      </Text>
                    )}
                  </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className={styles.summary}>
            <Text view="p-18" weight="bold" className={styles.summaryTitle}>
              Summary
            </Text>
            <div className={styles.summaryRow}>
              <Text view="p-16" color="secondary">
                Subtotal
              </Text>
              <Text view="p-16">{subtotal.toFixed(2)} ₽</Text>
            </div>
            <div className={styles.summaryRow}>
              <Text view="p-16" color="secondary">
                Shipping
              </Text>
              <Text view="p-16" color="accent">
                Free
              </Text>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <Text view="p-20" weight="bold">
                Total
              </Text>
              <Text view="p-20" weight="bold">
                {subtotal.toFixed(2)} ₽
              </Text>
            </div>

            <ShareButton
              label="Share cart"
              title="My cart"
              text={buildCartShareText()}
              className={styles.shareButton}
              disabled={items.length === 0}
            />

            <Button
              type="button"
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={checkingOut || paying}
            >
              {checkingOut ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        </div>
      )}

      {payOpen && (
        <div
          className={styles.payOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Payment"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !paying) setPayOpen(false);
          }}
        >
          <div className={styles.payModal}>
            <div className={styles.payHeader}>
              <Text tag="h3" view="p-20" weight="medium">
                Payment
              </Text>
              <button
                type="button"
                className={styles.payClose}
                onClick={() => setPayOpen(false)}
                disabled={paying}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.payBody}>
              <div className={styles.payProduct}>
                <div className={styles.payProductImageWrap}>
                  <Image
                    src={payPreview?.imageUrl ?? DEFAULT_PRODUCT_IMAGE}
                    alt={payPreview?.title ?? 'Order'}
                    fill
                    sizes="56px"
                    className={styles.payProductImage}
                  />
                </div>
                <div className={styles.payProductInfo}>
                  <Text view="p-16" weight="medium" maxLines={2}>
                    {payPreview?.title ?? 'Order'}
                  </Text>
                  <Text view="p-14" color="secondary">
                    Qty: {payPreview?.qty ?? 1}
                    {payPreview?.restCount ? ` • +${payPreview.restCount} more` : ''}
                  </Text>
                </div>
              </div>

              <div className={styles.payRow}>
                <Text view="p-16" weight="medium">
                  Total
                </Text>
                <Text view="p-16" weight="medium">
                  {subtotal.toFixed(2)} ₽
                </Text>
              </div>

              <div className={styles.paySection}>
                <Text view="p-16" weight="medium">
                  Choose a card
                </Text>

                {sortedCards.length === 0 ? (
                  <div className={styles.payEmpty}>
                    <Text view="p-14" color="secondary">
                      You don&apos;t have saved cards yet.
                    </Text>
                    <Link className={styles.payLink} href="/profile/settings" onClick={() => setPayOpen(false)}>
                      Add a card in settings
                    </Link>
                  </div>
                ) : (
                  <div className={styles.cardList}>
                    {sortedCards.map((c) => (
                      <label key={c.id} className={styles.cardOption}>
                        <input
                          type="radio"
                          name="paymentCard"
                          checked={selectedCardId === c.id}
                          onChange={() => setSelectedCardId(c.id)}
                          disabled={paying}
                        />
                        <span className={styles.cardOptionText}>
                          •••• {c.last4}{' '}
                          <span className={styles.cardOptionMeta}>
                            {c.expMonth}/{c.expYear?.slice?.(-2)}
                          </span>
                          {c.isDefault && <span className={styles.defaultPill}>Default</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {payError && (
                <Text view="p-14" className={styles.payError}>
                  {payError}
                </Text>
              )}
            </div>

            <div className={styles.payFooter}>
              <Button
                type="button"
                className={styles.payCancelButton}
                onClick={() => setPayOpen(false)}
                disabled={paying}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePay}
                loading={paying}
                disabled={sortedCards.length === 0 || !selectedCardId}
              >
                Pay now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(ProfileCartPage);
