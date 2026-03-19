'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DRAGGABLE_PRODUCT_ATTR } from 'lib/dragDrop';
import { ComparisonWidgetContent } from '../ComparisonWidgetContent/ComparisonWidgetContent';
import type { Product } from 'api/types';
import styles from './ComparisonWidgetOverlay.module.scss';

export type ComparisonWidgetOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (documentId: string) => void;
  onClear: () => void;
};

export function ComparisonWidgetOverlay({
  isOpen,
  onClose,
  onAddProduct,
  onRemoveProduct,
  onClear,
}: ComparisonWidgetOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest?.(`[data-comparison-trigger="true"]`)) return;
      if (target.closest?.(`[${DRAGGABLE_PRODUCT_ATTR}]`)) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClose, isOpen]);

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
            <ComparisonWidgetContent
              variant="overlay"
              onAddProduct={onAddProduct}
              onRemoveProduct={onRemoveProduct}
              onClear={onClear}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

