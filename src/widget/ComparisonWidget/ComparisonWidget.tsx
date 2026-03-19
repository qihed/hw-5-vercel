'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/src/store/StoreContext';
import { createDropZoneHandlers, DRAGGABLE_PRODUCT_ATTR } from 'lib/dragDrop';
import { getProductImageUrl, getProductCategoryName, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import { getProductExtendedProps } from 'lib/productExtendedProps';
import { ProductPropsPopover } from './ProductPropsPopover';
import type { Product } from 'api/types';
import styles from './ComparisonWidget.module.scss';

function getComparisonTitle(products: Product[]): string {
  if (products.length === 0) return 'Сравнение';
  const props = getProductExtendedProps(products[0]);
  return props.company ? `Сравнение с ${props.company}` : 'Сравнение';
}

export type ComparisonWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const ComparisonWidget = ({ isOpen, onClose, triggerRef }: ComparisonWidgetProps) => {
  const { comparison } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const dropHandlers = createDropZoneHandlers<Product>((product) => comparison.addProduct(product), ['product']);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (triggerRef?.current?.contains(target)) return;
      if (target.closest?.(`[${DRAGGABLE_PRODUCT_ATTR}]`)) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className={styles.backdrop}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          <motion.div
            key="panel"
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-label="Сравнение товаров"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{getComparisonTitle(comparison.products)}</h2>
            </div>

            <div className={styles.dropZone} {...dropHandlers}>
              <span className={styles.dropHint}>Перетащите товар сюда</span>
              <span className={styles.dropSub}>или кликните на карточку и перетащите</span>
            </div>

            <div className={styles.list}>
              {comparison.products.length === 0 ? (
                <motion.p
                  key="empty"
                  className={styles.empty}
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
                    {comparison.products.map((product) => (
                      <motion.div
                        key={product.documentId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      >
                        <ComparisonItem product={product} onRemove={() => comparison.removeProduct(product.documentId)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {comparison.products.length > 0 && (
                <motion.button
                  key="clearBtn"
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => comparison.clear()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  Очистить сравнение
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ComparisonItem = ({ product, onRemove }: { product: Product; onRemove: () => void }) => {
  const [showProps, setShowProps] = useState(false);
  const imageUrl = getProductImageUrl(product) || DEFAULT_PRODUCT_IMAGE;
  const category = getProductCategoryName(product);
  const extendedProps = getProductExtendedProps(product);

  return (
    <AnimatePresence initial={false}>
      {showProps ? (
        <motion.div
          key="expanded"
          className={styles.itemExpanded}
          initial={{ opacity: 0, y: 6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          layout
        >
          <div className={styles.itemExpandedContent}>
            <Link
              href={`/products/${product.documentId}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.itemImageFull}>
                <Image src={imageUrl} alt={product.title} fill sizes="320px" />
              </div>
            </Link>
            <div className={styles.itemInfoRow}>
              <Link
                href={`/products/${product.documentId}`}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.itemInfoBlock}>
                  {category && <span className={styles.itemCategory}>{category}</span>}
                  <span className={styles.itemTitle}>{product.title}</span>
                  <span className={styles.itemPrice}>{product.price}₽</span>
                </div>
              </Link>
              <button type="button" className={styles.removeBtn} onClick={onRemove} aria-label="Удалить из сравнения">
                ×
              </button>
            </div>
            <ProductPropsPopover props={extendedProps} onClose={() => setShowProps(false)} block />
            <div className={styles.itemExpandedActions}>
              <button
                type="button"
                className={styles.characteristicsBtn}
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
          className={styles.item}
          initial={{ opacity: 0, y: 6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          layout
        >
          <div className={styles.itemLink}>
            <div className={styles.itemImage}>
              <Image src={imageUrl} alt={product.title} fill sizes="80px" />
            </div>
            <div className={styles.itemInfo}>
              <Link
                href={`/products/${product.documentId}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => e.stopPropagation()}
              >
                {category && <span className={styles.itemCategory}>{category}</span>}
                <span className={styles.itemTitle}>{product.title}</span>
                <span className={styles.itemPrice}>{product.price}₽</span>
              </Link>
              <button
                type="button"
                className={styles.characteristicsBtn}
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
          <button type="button" className={styles.removeBtn} onClick={onRemove} aria-label="Удалить из сравнения">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default observer(ComparisonWidget);

