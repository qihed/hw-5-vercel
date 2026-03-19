'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import type { Product } from 'api/types';
import type { ProductExtendedProps } from '../../adapters/productPropsRepository';
import { getProductCategoryName, getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import { ProductPropsPopover } from '../ProductPropsPopover/ProductPropsPopover';
import sharedStyles from '../ComparisonWidgetOverlay/ComparisonWidgetOverlay.module.scss';
import styles from './ComparisonItem.module.scss';

export type ComparisonItemProps = {
  variant: 'overlay' | 'pip';
  product: Product;
  baseUrl?: string;
  extendedProps: ProductExtendedProps;
  onRemove: () => void;
};

export const ComparisonItem = observer(function ComparisonItem({
  variant,
  product,
  baseUrl,
  extendedProps,
  onRemove,
}: ComparisonItemProps) {
  const [showProps, setShowProps] = useState(false);
  const imageUrl = getProductImageUrl(product) || DEFAULT_PRODUCT_IMAGE;
  const category = getProductCategoryName(product);

  if (variant === 'pip') {
    if (showProps) {
      return (
        <div className={styles.pipExpandedItem}>
          <div className={styles.pipExpandedContainer}>
            <a href={`${baseUrl}/products/${product.documentId}`} target="_blank" rel="noopener noreferrer" className={styles.pipNoDecorLink}>
              <div className={styles.pipImageFull}>
                <Image src={imageUrl} alt={product.title} fill className={styles.pipImageObject} sizes="(max-width: 400px) 100vw, 400px" />
              </div>
            </a>
            <div className={styles.pipInfoRow}>
              <a href={`${baseUrl}/products/${product.documentId}`} target="_blank" rel="noopener noreferrer" className={styles.pipNoDecorFlexLink}>
                <div className={styles.pipInfoBlock}>
                  {category && <span className={styles.pipCategory}>{category}</span>}
                  <span className={styles.pipTitle}>{product.title}</span>
                  <span className={styles.pipPrice}>{product.price}₽</span>
                </div>
              </a>
              <button type="button" onClick={onRemove} aria-label="Удалить из сравнения" className={styles.pipRemoveBtn}>
                ×
              </button>
            </div>

            <ProductPropsPopover props={extendedProps} onClose={() => setShowProps(false)} block inline />

            <div className={styles.pipCollapseRow}>
              <button
                type="button"
                className={styles.pipCharacteristicsBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProps(false);
                }}
              >
                Свернуть
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.pipItem}>
        <div className={styles.pipCollapsedRow}>
          <a href={`${baseUrl}/products/${product.documentId}`} target="_blank" rel="noopener noreferrer" className={styles.pipItemLink}>
            <div className={styles.pipItemImage}>
              <Image src={imageUrl} alt={product.title} fill className={styles.pipImageObject} sizes="64px" />
            </div>
            <div className={styles.pipItemInfo}>
              {category && <span className={styles.pipCategory}>{category}</span>}
              <span className={styles.pipTitle}>{product.title}</span>
              <span className={styles.pipPrice}>{product.price}₽</span>
            </div>
          </a>
          <button
            type="button"
            className={styles.pipCharacteristicsBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowProps(true);
            }}
          >
            Характеристики
          </button>
        </div>
        <button type="button" onClick={onRemove} aria-label="Удалить из сравнения" className={styles.pipRemoveBtn}>
          ×
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {showProps ? (
        <motion.div
          key="expanded"
          className={sharedStyles.itemExpanded}
          initial={{ opacity: 0, y: 6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          layout
        >
          <div className={sharedStyles.itemExpandedContent}>
            <Link href={`/products/${product.documentId}`} className={styles.linkReset} onClick={(e) => e.stopPropagation()}>
              <div className={sharedStyles.itemImageFull}>
                <Image src={imageUrl} alt={product.title} fill sizes="320px" />
              </div>
            </Link>
            <div className={sharedStyles.itemInfoRow}>
              <Link href={`/products/${product.documentId}`} className={styles.linkResetFlex} onClick={(e) => e.stopPropagation()}>
                <div className={sharedStyles.itemInfoBlock}>
                  {category && <span className={sharedStyles.itemCategory}>{category}</span>}
                  <span className={sharedStyles.itemTitle}>{product.title}</span>
                  <span className={sharedStyles.itemPrice}>{product.price}₽</span>
                </div>
              </Link>
              <button type="button" className={sharedStyles.removeBtn} onClick={onRemove} aria-label="Удалить из сравнения">
                ×
              </button>
            </div>

            <ProductPropsPopover props={extendedProps} onClose={() => setShowProps(false)} block />

            <div className={sharedStyles.itemExpandedActions}>
              <button
                type="button"
                className={sharedStyles.characteristicsBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProps(false);
                }}
              >
                Свернуть
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="collapsed"
          className={sharedStyles.item}
          initial={{ opacity: 0, y: 6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          layout
        >
          <div className={sharedStyles.itemLink}>
            <div className={sharedStyles.itemImage}>
              <Image src={imageUrl} alt={product.title} fill sizes="80px" />
            </div>
            <div className={sharedStyles.itemInfo}>
              <Link href={`/products/${product.documentId}`} className={styles.linkReset} onClick={(e) => e.stopPropagation()}>
                {category && <span className={sharedStyles.itemCategory}>{category}</span>}
                <span className={sharedStyles.itemTitle}>{product.title}</span>
                <span className={sharedStyles.itemPrice}>{product.price}₽</span>
              </Link>
              <button
                type="button"
                className={sharedStyles.characteristicsBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProps(true);
                }}
              >
                Характеристики
              </button>
            </div>
          </div>
          <button type="button" className={sharedStyles.removeBtn} onClick={onRemove} aria-label="Удалить из сравнения">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

