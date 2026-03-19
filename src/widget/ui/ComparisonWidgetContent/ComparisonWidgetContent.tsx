'use client';

import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from 'api/types';
import { createDropZoneHandlers } from 'lib/dragDrop';
import { useStore } from 'store/StoreContext';
import { ComparisonItem } from '../ComparisonItem/ComparisonItem';
import type { ProductExtendedProps } from '../../adapters/productPropsRepository';
import sharedStyles from '../ComparisonWidgetOverlay/ComparisonWidgetOverlay.module.scss';
import styles from './ComparisonWidgetContent.module.scss';

export type ComparisonWidgetContentProps = {
  variant: 'overlay' | 'pip';
  baseUrl?: string;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (documentId: string) => void;
  onClear: () => void;
};

function getComparisonTitle(products: Product[], firstProps?: ProductExtendedProps): string {
  if (products.length === 0) return 'Сравнение';
  return firstProps?.company ? `Сравнение с ${firstProps.company}` : 'Сравнение';
}

export const ComparisonWidgetContent = observer(function ComparisonWidgetContent({
  variant,
  baseUrl,
  onAddProduct,
  onRemoveProduct,
  onClear,
}: ComparisonWidgetContentProps) {
  const { comparison, productProps } = useStore();
  const products = comparison.products;

  const dropHandlers = useMemo(() => {
    return createDropZoneHandlers<Product>((product) => onAddProduct(product), ['product']);
  }, [onAddProduct]);

  const firstProps = products[0] ? productProps.getByDocumentId(products[0].documentId) : undefined;
  const title = getComparisonTitle(products, firstProps);

  if (variant === 'pip') {
    return (
      <>
        <div className={styles.pipHeader}>
          <h2 className={styles.pipTitle}>{title}</h2>
        </div>
        <div {...dropHandlers} className={styles.pipDropZone}>
          <span className={styles.pipDropHint}>Перетащите товар сюда</span>
          <span className={styles.pipDropSub}>Скиньте товары, затем перейдите на сайт конкурента и убедитесь, что мы лучше — окно останется поверх</span>
        </div>
        <div className={styles.pipList}>
          {products.length === 0 ? (
            <p className={styles.pipEmpty}>Нет товаров для сравнения</p>
          ) : (
            products.map((product) => (
              <ComparisonItem
                key={product.documentId}
                variant="pip"
                product={product}
                baseUrl={baseUrl}
                extendedProps={productProps.getByDocumentId(product.documentId) || {}}
                onRemove={() => onRemoveProduct(product.documentId)}
              />
            ))
          )}
        </div>
        {products.length > 0 && (
          <button type="button" onClick={onClear} className={styles.pipClearBtn}>
            Очистить сравнение
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <div className={sharedStyles.header}>
        <h2 className={sharedStyles.title}>{title}</h2>
      </div>
      <div className={sharedStyles.dropZone} {...dropHandlers}>
        <span className={sharedStyles.dropHint}>Перетащите товар сюда</span>
        <span className={sharedStyles.dropSub}>или кликните на карточку и перетащите</span>
      </div>
      <div className={sharedStyles.list}>
        {products.length === 0 ? (
          <motion.p
            key="empty"
            className={sharedStyles.empty}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            Нет товаров для сравнения
          </motion.p>
        ) : (
          <motion.div layout>
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.documentId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <ComparisonItem
                    variant="overlay"
                    product={product}
                    extendedProps={productProps.getByDocumentId(product.documentId) || {}}
                    onRemove={() => onRemoveProduct(product.documentId)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {products.length > 0 && (
          <motion.button
            key="clearBtn"
            type="button"
            className={sharedStyles.clearBtn}
            onClick={onClear}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            Очистить сравнение
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
});

