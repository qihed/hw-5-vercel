'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import Text from 'components/Text';
import Button from 'components/Button';
import type { Order } from 'lib/ordersStorage';
import styles from './orders-page.module.scss';
import { useOrdersPageModel } from './useOrdersPageModel';

const statusClass: Record<Order['status'], string> = {
  delivered: 'statusDelivered',
  in_transit: 'statusInTransit',
  processing: 'statusProcessing',
};

const OrdersPage = () => {
  const {
    orders,
    ordersLoaded,
    deliveryPopup,
    deliveryDaysSuffix,
    closeDeliveryPopup,
    removeOrder,
    hasProfileAddress,
  } = useOrdersPageModel();

  const emptyStateSubtitle = useMemo(
    () => 'Once you place an order, it will show up here with status and details.',
    []
  );

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        My Orders
      </Text>

      {deliveryPopup && (
        <div
          className={styles.deliveryOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Delivery details"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDeliveryPopup();
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
                onClick={closeDeliveryPopup}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.deliveryBody}>
              <Text view="p-16">
                Your order will arrive in about <b>{deliveryPopup.days}</b> {deliveryDaysSuffix}.
              </Text>
              {deliveryPopup.orderId !== null && (
                <Text view="p-14" color="secondary">
                  Order #{deliveryPopup.orderId}
                </Text>
              )}
              <div className={styles.deliveryAddressBlock}>
                <Text view="p-14" color="secondary">
                  Delivery address
                </Text>
                <Text view="p-16" weight="medium">
                  {deliveryPopup.address ? deliveryPopup.address : 'No delivery address set in your profile.'}
                </Text>
              </div>
            </div>

            <div className={styles.deliveryFooter}>
              <Button type="button" onClick={closeDeliveryPopup}>
                Got it
              </Button>
              {/* preserve behavior: show link only when profile address is empty */}
              {!hasProfileAddress && (
                <Link href="/profile" className={styles.deliveryLink} onClick={closeDeliveryPopup}>
                  Add address in profile
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {!ordersLoaded ? (
        <Text view="p-16" color="secondary">
          Loading...
        </Text>
      ) : orders.length === 0 ? (
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
              {emptyStateSubtitle}
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
                <button
                  type="button"
                  className={styles.actionButtonDelete}
                  onClick={() => removeOrder(order.id)}
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

