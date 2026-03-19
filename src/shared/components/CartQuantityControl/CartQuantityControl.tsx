'use client';

import { useSyncExternalStore } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import Button from 'components/Button';
import { useStore } from 'store/StoreContext';

import styles from './CartQuantityControl.module.scss';

export type CartQuantityControlProps = {
  productId: number;
  stopLinkNavigation?: boolean;
  addLabel?: string;
  buttonClassName?: string;
  showRemove?: boolean;
  className?: string;
};

const stopLink = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const CartQuantityControl = ({
  productId,
  stopLinkNavigation = false,
  addLabel = 'В корзину',
  buttonClassName,
  showRemove = false,
  className,
}: CartQuantityControlProps) => {
  const { cart, auth } = useStore();
  const qty = cart.getQuantity(productId);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const safeQty = isHydrated ? qty : 0;

  const guardAuth = (fn: () => void) => () => {
    if (!auth.isAuth) {
      toast.error('To add items to your cart, please register first.');
      return;
    }
    fn();
  };

  const wrap = (fn: () => void) =>
    stopLinkNavigation
      ? (e: React.MouseEvent) => {
          stopLink(e);
          fn();
        }
      : () => fn();

  const handleDecrease = wrap(() => {
    if (safeQty > 0) cart.setQuantity(productId, safeQty - 1);
  });

  const handleIncrease = wrap(guardAuth(() => {
    cart.addItem(productId, 1);
  }));

  const handleAdd = wrap(guardAuth(() => {
    cart.addItem(productId, 1);
  }));

  const handleRemove = wrap(() => {
    cart.removeItem(productId);
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {safeQty > 0 ? (
        <motion.div
          key="controls"
          className={`${styles.controls} ${className ?? ''}`.trim()}
          onClick={stopLinkNavigation ? stopLink : undefined}
          role="group"
          aria-label="Количество в корзине"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Button
            type="button"
            className={buttonClassName}
            onClick={handleDecrease}
            aria-label="Убрать одну"
          >
            −
          </Button>
          <motion.span
            key={safeQty}
            className={styles.qty}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            {safeQty}
          </motion.span>
          <Button
            type="button"
            className={buttonClassName}
            onClick={handleIncrease}
            aria-label="Добавить одну"
          >
            +
          </Button>
          {showRemove && (
            <Button type="button" className={buttonClassName} onClick={handleRemove}>
              Удалить
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="add"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Button className={buttonClassName} onClick={handleAdd}>
            {addLabel}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default observer(CartQuantityControl);
