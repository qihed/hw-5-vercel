'use client';

import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import Text from 'components/Text';
import Button from 'components/Button';
import CartQuantityControl from 'components/CartQuantityControl';
import { useStore } from 'store/StoreContext';
import ShareButton from 'components/ShareButton';

import styles from './cart-page.module.scss';

const CartPage = () => {
  const { cart } = useStore();
  const items = cart.items;

  const buildCartShareText = () => {
    if (items.length === 0) return '';

    const lines = items.map((item) => {
      const qty = item.quantity ?? 1;
      const productUrl = `/products/${item.productId}`;
      return `- Товар ${item.productId} (x${qty}): ${productUrl}`;
    });

    return `Смотри, что у меня в корзине:\n${lines.join('\n')}\nКорзина: /cart`;
  };

  return (
    <>
      <div className={styles.head}>
        <Text view="title">Корзина</Text>
        <Text view="p-20" color="secondary">
          Товаров: {cart.totalCount}
        </Text>
      </div>

      {items.length === 0 ? (
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
              Ваша корзина пуста
            </Text>
            <Text view="p-16" color="secondary" tag="p" className={styles.emptySubtitle}>
              Добавьте товары из каталога — они появятся здесь.
            </Text>
          </div>
          <div className={styles.emptyActions}>
            <Link href="/products" className={styles.backLink}>
              <Button type="button" className={styles.emptyCta}>
                Перейти в каталог
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.productId}
                  className={styles.item}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  layout
                >
                  <div className={styles.meta}>
                    <Text view="p-20">{item.productId}</Text>
                  </div>
                  <CartQuantityControl
                    productId={item.productId}
                    showRemove
                    className={styles.controls}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className={styles.footer}>
            <div className={styles.footerActions}>
              <ShareButton
                label="Поделиться корзиной"
                title="Моя корзина"
                text={buildCartShareText()}
                disabled={items.length === 0}
              />
              <Button type="button" onClick={() => cart.clear()}>
                Очистить корзину
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default observer(CartPage);
