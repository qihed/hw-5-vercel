'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import Text from 'components/Text';
import Button from 'components/Button';
import { readOrdersFromStorage, removeOrderFromStorage, type Order } from 'lib/ordersStorage';
import { useStore } from 'store/StoreContext';
import styles from './orders-page.module.scss';

type DeliveryPopupPayload = {
  days: number;
  address?: string;
  orderId?: number;
  createdAt?: number;
};

const POSTPAYMENT_POPUP_STORAGE_KEY = 'postPayment.deliveryPopup.v1';

const statusClass: Record<Order['status'], string> = {
  delivered: 'statusDelivered',
  in_transit: 'statusInTransit',
  processing: 'statusProcessing',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { auth } = useStore();
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState<number>(5);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryOrderId, setDeliveryOrderId] = useState<number | null>(null);

  useEffect(() => {
    setOrders(readOrdersFromStorage());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(POSTPAYMENT_POPUP_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return;
      const p = parsed as DeliveryPopupPayload;
      const days = typeof p.days === 'number' ? p.days : 5;
      const addressFromPayload = typeof p.address === 'string' ? p.address : '';
      const address = (addressFromPayload || auth.address || '').trim();

      setDeliveryDays(days >= 5 && days <= 7 ? days : 5);
      setDeliveryAddress(address);
      setDeliveryOrderId(typeof p.orderId === 'number' ? p.orderId : null);
      setDeliveryOpen(true);
    } catch {
      return;
    } finally {
      try {
        window.localStorage.removeItem(POSTPAYMENT_POPUP_STORAGE_KEY);
      } catch {
        return;
      }
    }
  }, [auth.address]);

  const handleRemoveOrder = useCallback((orderId: number) => {
    removeOrderFromStorage(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        My Orders
      </Text>

      {deliveryOpen && (
        <div
          className={styles.deliveryOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Delivery details"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeliveryOpen(false);
          }}
        >
          <div className={styles.deliveryModal}>
            <div className={styles.deliveryHeader}>
              <Text tag="h3" view="p-20" weight="medium">
                Payment successful
              </Text>
              <button
                type="button"
                className={styles.deliveryClose}
                onClick={() => setDeliveryOpen(false)}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.deliveryBody}>
              <Text view="p-16">
                Your order will arrive in about <b>{deliveryDays}</b> {deliveryDays === 1 ? 'day' : 'days'}.
              </Text>
              {deliveryOrderId !== null && (
                <Text view="p-14" color="secondary">
                  Order #{deliveryOrderId}
                </Text>
              )}
              <div className={styles.deliveryAddressBlock}>
                <Text view="p-14" color="secondary">
                  Delivery address
                </Text>
                <Text view="p-16" weight="medium">
                  {deliveryAddress ? deliveryAddress : 'No delivery address set in your profile.'}
                </Text>
              </div>
            </div>

            <div className={styles.deliveryFooter}>
              <Button type="button" onClick={() => setDeliveryOpen(false)}>
                Got it
              </Button>
              {!auth.address?.trim() && (
                <Link href="/profile" className={styles.deliveryLink} onClick={() => setDeliveryOpen(false)}>
                  Add address in profile
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 8h7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8.5 12h7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8.5 16h4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.emptyText}>
            <Text view="p-20" weight="bold" tag="p" className={styles.emptyTitle}>
              No orders yet
            </Text>
            <Text view="p-16" color="secondary" tag="p" className={styles.emptySubtitle}>
              Once you place an order, it will show up here with status and details.
            </Text>
          </div>
          <div className={styles.emptyActions}>
            <Link href="/products" className={styles.emptyLink}>
              <Button type="button" className={styles.emptyCta}>
                Browse products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <div className={styles.orderTitleRow}>
                  <Text view="p-18" weight="bold">
                    Order #{order.id}
                  </Text>
                  <span className={`${styles.statusBadge} ${styles[statusClass[order.status]]}`}>
                    {order.statusLabel}
                  </span>
                </div>
                <Text view="p-14" color="secondary">
                  {order.date}
                </Text>
              </div>
              <div className={styles.orderTotal}>
                <Text view="p-14" color="secondary">
                  Total
                </Text>
                <Text view="p-20" weight="bold">
                  {order.total.toFixed(2)} ₽
                </Text>
              </div>
            </div>

            <div className={styles.orderItems}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.orderItem}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className={styles.itemImageImg}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <Text view="p-16" weight="medium">
                      {item.name}
                    </Text>
                    <Text view="p-14" color="secondary">
                      Quantity: {item.quantity}
                    </Text>
                  </div>
                  <div className={styles.itemPrice}>
                    <Text view="p-16" weight="medium">
                      {item.price.toFixed(2)} ₽
                    </Text>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderActions}>
              <button type="button" className={styles.actionButton}>
                Track Order
              </button>
              <button type="button" className={styles.actionButton}>
                Reorder
              </button>
              <button
                type="button"
                className={styles.actionButtonDelete}
                onClick={() => handleRemoveOrder(order.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default observer(OrdersPage);
