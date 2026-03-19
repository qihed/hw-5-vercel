'use client';

import type { Product } from 'api/types';
import { ComparisonWidgetContent } from '../ComparisonWidgetContent/ComparisonWidgetContent';
import styles from './ComparisonWidgetPiPSurface.module.scss';

export type ComparisonWidgetPiPSurfaceProps = {
  baseUrl: string;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (documentId: string) => void;
  onClear: () => void;
};

export function ComparisonWidgetPiPSurface({
  baseUrl,
  onClose,
  onAddProduct,
  onRemoveProduct,
  onClear,
}: ComparisonWidgetPiPSurfaceProps) {
  return (
    <div className={styles.container}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
        ×
      </button>

      <ComparisonWidgetContent
        variant="pip"
        baseUrl={baseUrl}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
        onClear={onClear}
      />
    </div>
  );
}

