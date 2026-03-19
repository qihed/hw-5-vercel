'use client';

import Text from 'components/Text';
import styles from './cart-page.module.scss';

export default function CartPageSkeleton() {
  return (
    <div className={styles.cartLayout} aria-hidden>
      <div className={styles.cartItems}>
        <div className={styles.cartItem}>
          <div className={`${styles.itemImageWrap} ${styles.skeletonBlock}`} />

          <div className={styles.itemDetails}>
            <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonSubtitle}`} />

            <div className={styles.quantityControls}>
              <div className={`${styles.qtyBtn} ${styles.skeletonBlock}`} />
              <div className={`${styles.qtyValue} ${styles.skeletonLine} ${styles.skeletonQty}`} />
              <div className={`${styles.qtyBtn} ${styles.skeletonBlock}`} />
              <div className={`${styles.deleteBtn} ${styles.skeletonBlock}`} />
            </div>
          </div>

          <div className={styles.itemPricing}>
            <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonEachPrice}`} />
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <Text view="p-18" weight="bold" className={styles.summaryTitle}>
          Summary
        </Text>

        <div className={styles.summaryRow}>
          <Text view="p-16" color="secondary">
            Subtotal
          </Text>
          <div className={`${styles.skeletonLine} ${styles.skeletonSummaryValue}`} />
        </div>

        <div className={styles.summaryRow}>
          <Text view="p-16" color="secondary">
            Shipping
          </Text>
          <div className={`${styles.skeletonLine} ${styles.skeletonSummaryValue}`} />
        </div>

        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <Text view="p-20" weight="bold">
            Total
          </Text>
          <div className={`${styles.skeletonLine} ${styles.skeletonSummaryTotal}`} />
        </div>

        <div className={`${styles.shareButton} ${styles.skeletonButton}`} />
        <div className={`${styles.checkoutButton} ${styles.skeletonButton}`} />
      </div>
    </div>
  );
}

