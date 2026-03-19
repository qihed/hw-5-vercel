'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import styles from 'components/ProductCardList/ProductCardList.module.scss';
import Card from 'components/Card';
import type { Product } from 'api/types';
import { getProductImageUrl, getProductCategoryName, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import CartQuantityControl from 'components/CartQuantityControl';
import FavoriteToggleButton from 'components/FavoriteToggleButton';
import { createDraggableHandlers, DRAGGABLE_PRODUCT_ATTR } from 'lib/dragDrop';

export type ProductCardListProps = {
  products: Product[];
  loading?: boolean;
  error?: Error | null;
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN: [number, number, number, number] = [0.7, 0, 0.84, 0];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: EASE_IN },
  },
};

const ProductCardList = ({ products, loading = false, error = null }: ProductCardListProps) => {
  if (error) {
    return (
      <div className={styles.container}>
        <p>Ошибка загрузки: {error.message}</p>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <p>Загрузка…</p>
      </div>
    );
  }

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <motion.div
            key={product.documentId}
            className={styles.cardLink}
            layout="position"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.995 }}
            transition={{ layout: { duration: 0.5, ease: EASE_OUT } }}
          >
            {/* HTML5 drag handlers must live on a regular div (not on motion.div) */}
            <div
              style={{ display: 'flex', flex: 1, minWidth: 0 }}
              {...{ [DRAGGABLE_PRODUCT_ATTR]: true }}
              {...createDraggableHandlers(product, 'product')}
            >
              <Link
                href={`/products/${product.documentId}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flex: 1, minWidth: 0 }}
              >
                <Card
                  image={getProductImageUrl(product) || DEFAULT_PRODUCT_IMAGE}
                  captionSlot={getProductCategoryName(product) || null}
                  title={product.title}
                  subtitle={product.description || '—'}
                  contentSlot={<>{product.price}₽</>}
                  actionSlot={
                    <div className={styles.cardActions}>
                      <CartQuantityControl
                        productId={product.id}
                        stopLinkNavigation
                        addLabel="In cart"
                      />
                    </div>
                  }
                />
              </Link>
              <FavoriteToggleButton
                productId={product.id}
                stopLinkNavigation
                className={styles.favoriteTopRight}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default observer(ProductCardList);
