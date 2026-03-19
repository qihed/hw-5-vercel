'use client';

import { useEffect, useRef } from 'react';
import type { ProductExtendedProps } from 'widget/adapters/productPropsRepository';
import sharedStyles from '../ComparisonWidgetOverlay/ComparisonWidgetOverlay.module.scss';
import styles from './ProductPropsPopover.module.scss';

export type ProductPropsPopoverProps = {
  props: ProductExtendedProps;
  anchorRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  inline?: boolean;
  block?: boolean;
};

const LABELS: Record<keyof ProductExtendedProps, string> = {
  material: 'Материал',
  year: 'Год издания',
  company: 'Компания',
  model: 'Модель',
  warranty: 'Гарантийный срок',
  deliveryTime: 'Ориентировочное время доставки',
};

function PropsContent({ props }: { props: ProductExtendedProps }) {
  return (
    <>
      {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
        <div key={key} className={styles.inlineRow}>
          <dt className={styles.inlineDt}>{LABELS[key]}</dt>
          <dd className={styles.inlineDd}>{props[key] ?? '—'}</dd>
        </div>
      ))}
    </>
  );
}

export function ProductPropsPopover({ props, anchorRef, onClose, inline = false, block = false }: ProductPropsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (block) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || anchorRef?.current?.contains(target)) return;
      onClose();
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
  }, [block, onClose, anchorRef]);

  if (block) {
    const rootClassName = inline ? styles.blockInlineRoot : sharedStyles.propsBlock;
    const listClassName = inline ? styles.blockInlineList : sharedStyles.propsBlockList;

    return (
      <div ref={inline ? undefined : popoverRef} className={rootClassName} role="region" aria-label="Характеристики товара">
        <dl className={listClassName}>
          {inline ? (
            <PropsContent props={props} />
          ) : (
            (Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
              <div key={key} className={sharedStyles.propsRow}>
                <dt className={sharedStyles.propsLabel}>{LABELS[key]}</dt>
                <dd className={sharedStyles.propsValue}>{props[key] ?? '—'}</dd>
              </div>
            ))
          )}
        </dl>
      </div>
    );
  }

  if (inline) {
    return (
      <div ref={popoverRef} role="dialog" aria-label="Дополнительные характеристики" className={styles.inlinePopover}>
        <div className={styles.inlineHeader}>
          <span className={styles.inlineHeaderTitle}>Тестовый режим</span>
          <button type="button" onClick={onClose} aria-label="Закрыть" className={styles.inlineCloseBtn}>
            ×
          </button>
        </div>
        <dl className={styles.inlineList}>
          {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
            <div key={key} className={styles.inlineRow}>
              <dt className={styles.inlineDt}>{LABELS[key]}</dt>
              <dd className={styles.inlineDd}>{props[key] ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div ref={popoverRef} className={sharedStyles.propsPopover} role="dialog" aria-label="Дополнительные характеристики">
      <div className={sharedStyles.propsPopoverHeader}>
        <span className={sharedStyles.propsPopoverTitle}>Тестовый режим</span>
        <button type="button" className={sharedStyles.propsPopoverClose} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </div>
      <dl className={sharedStyles.propsList}>
        {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
          <div key={key} className={sharedStyles.propsRow}>
            <dt className={sharedStyles.propsLabel}>{LABELS[key]}</dt>
            <dd className={sharedStyles.propsValue}>{props[key] ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

