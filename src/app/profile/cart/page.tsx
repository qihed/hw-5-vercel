'use client';

import Image from 'next/image';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import Text from 'components/Text';
import Button from 'components/Button';
import ShareButton from 'components/ShareButton';
import styles from './cart-page.module.scss';
import { useCartPageModel } from './useCartPageModel';
import CartEmptyIcon from 'icons/CartEmptyIcon';
import TrashIcon from 'icons/TrashIcon';
import CartPageSkeleton from './CartPageSkeleton';

const ProfileCartPage = () => {
  const {
    items,
    loadingProducts,
    subtotal,
    cartLines,
    shareText,
    payOpen,
    paying,
    checkingOut,
    payError,
    sortedCards,
    selectedCardId,
    openPayModal,
    closePayModal,
    selectCard,
    handlePay,
    setQuantity,
    addItem,
    removeItem,
  } = useCartPageModel();

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <Text view="title" tag="h1" className={styles.title}>
          Cart
        </Text>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>
            <CartEmptyIcon />
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

      {loadingProducts ? (
        <CartPageSkeleton />
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.cartItems}>
            <AnimatePresence initial={false}>
              {cartLines.map((line) => {
                const { productId, qty, totalPrice, price, imageUrl, name, category } = line;

                return (
                  <motion.div
                    key={productId}
                    className={styles.cartItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    layout
                  >
                    <div className={styles.itemImageWrap}>
                      <Image src={imageUrl} alt={name} fill sizes="80px" className={styles.itemImage} />
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

                      <motion.div className={styles.quantityControls} layout>
                        <motion.button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => setQuantity(productId, qty - 1)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.92 }}
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                        >
                          −
                        </motion.button>

                        <motion.span
                          key={qty}
                          className={styles.qtyValue}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                        >
                          {qty}
                        </motion.span>

                        <motion.button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => addItem(productId, 1)}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.92 }}
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                        >
                          +
                        </motion.button>

                        <motion.button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => removeItem(productId)}
                          aria-label="Remove"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                        >
                          <TrashIcon />
                        </motion.button>
                      </motion.div>
                    </div>

                    <div className={styles.itemPricing}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={`${productId}:${qty}:${totalPrice.toFixed(2)}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                        >
                          <Text view="p-18" weight="bold">
                            {totalPrice.toFixed(2)} ₽
                          </Text>
                          {qty > 1 && (
                            <Text view="p-14" color="secondary">
                              {price.toFixed(2)} ₽ each
                            </Text>
                          )}
                        </motion.div>
                      </AnimatePresence>
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`subtotal:${subtotal.toFixed(2)}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <Text view="p-16">{subtotal.toFixed(2)} ₽</Text>
                </motion.div>
              </AnimatePresence>
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`total:${subtotal.toFixed(2)}`}
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Text view="p-20" weight="bold">
                    {subtotal.toFixed(2)} ₽
                  </Text>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ShareButton
                label="Share cart"
                title="My cart"
                text={shareText}
                className={styles.shareButton}
                disabled={items.length === 0}
              />
            </motion.div>

            <motion.div
              key={`checkout:${subtotal.toFixed(2)}:${items.length}`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <Button
                type="button"
                className={styles.checkoutButton}
                onClick={openPayModal}
                disabled={checkingOut || paying}
              >
                {checkingOut ? 'Processing...' : 'Checkout'}
              </Button>
            </motion.div>
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
            if (e.target === e.currentTarget && !paying) closePayModal();
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
                onClick={closePayModal}
                disabled={paying}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.payBody}>
              {cartLines.map((line) => (
                <div key={line.productId} className={styles.payProduct}>
                  <div className={styles.payProductImageWrap}>
                    <Image src={line.imageUrl} alt={line.name} fill sizes="56px" className={styles.payProductImage} />
                  </div>
                  <div className={styles.payProductInfo}>
                    <Text view="p-16" weight="medium" maxLines={2}>
                      {line.name}
                    </Text>
                    <Text view="p-14" color="secondary">
                      Qty: {line.qty} • {line.totalPrice.toFixed(2)} ₽
                    </Text>
                  </div>
                </div>
              ))}

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
                    <Link className={styles.payLink} href="/profile/settings" onClick={closePayModal}>
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
                          onChange={() => selectCard(c.id)}
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
              <Button type="button" className={styles.payCancelButton} onClick={closePayModal} disabled={paying}>
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

