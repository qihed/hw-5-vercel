'use client';

import { useEffect, useRef } from 'react';
import type { ProductExtendedProps } from 'lib/productExtendedProps';
import styles from './ComparisonWidget.module.scss';

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

const inlinePopoverStyle = {
  position: 'absolute' as const,
  bottom: '100%',
  left: 0,
  marginBottom: 6,
  zIndex: 300,
  minWidth: 240,
  maxWidth: 280,
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  border: '1px solid #eee',
  overflow: 'hidden' as const,
};

const inlineHeaderStyle = {
  display: 'flex' as const,
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: '#f8f8f8',
  borderBottom: '1px solid #eee',
};

const inlineRowStyle = {
  display: 'flex' as const,
  justifyContent: 'space-between',
  gap: 12,
  fontSize: 12,
  padding: '4px 0',
  borderBottom: '1px solid #f5f5f5',
};

const blockRowStyle = {
  display: 'flex' as const,
  justifyContent: 'space-between',
  gap: 12,
  fontSize: 12,
  padding: '4px 0',
  borderBottom: '1px solid #f5f5f5',
};

function PropsContent({ props }: { props: ProductExtendedProps }) {
  return (
    <>
      {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
        <div key={key} style={blockRowStyle}>
          <dt style={{ margin: 0, color: '#afadb5', flexShrink: 0 }}>{LABELS[key]}</dt>
          <dd style={{ margin: 0, textAlign: 'right', fontWeight: 500 }}>{props[key] ?? '—'}</dd>
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
    return (
      <div
        ref={inline ? undefined : popoverRef}
        className={inline ? undefined : styles.propsBlock}
        style={inline ? { margin: 0, padding: '8px 0 0' } : undefined}
        role="region"
        aria-label="Характеристики товара"
      >
        <dl style={inline ? { margin: 0, padding: 0 } : undefined} className={inline ? undefined : styles.propsBlockList}>
          {inline ? (
            <PropsContent props={props} />
          ) : (
            (Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
              <div key={key} className={styles.propsRow}>
                <dt className={styles.propsLabel}>{LABELS[key]}</dt>
                <dd className={styles.propsValue}>{props[key] ?? '—'}</dd>
              </div>
            ))
          )}
        </dl>
      </div>
    );
  }

  if (inline) {
    return (
      <div ref={popoverRef} role="dialog" aria-label="Дополнительные характеристики" style={inlinePopoverStyle}>
        <div style={inlineHeaderStyle}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#afadb5' }}>Тестовый режим</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              width: 24,
              height: 24,
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              color: '#afadb5',
            }}
          >
            ×
          </button>
        </div>
        <dl style={{ margin: 0, padding: '8px 12px 12px' }}>
          {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
            <div key={key} style={inlineRowStyle}>
              <dt style={{ margin: 0, color: '#afadb5', flexShrink: 0 }}>{LABELS[key]}</dt>
              <dd style={{ margin: 0, textAlign: 'right', fontWeight: 500 }}>{props[key] ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div ref={popoverRef} className={styles.propsPopover} role="dialog" aria-label="Дополнительные характеристики">
      <div className={styles.propsPopoverHeader}>
        <span className={styles.propsPopoverTitle}>Тестовый режим</span>
        <button type="button" className={styles.propsPopoverClose} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </div>
      <dl className={styles.propsList}>
        {(Object.keys(LABELS) as (keyof ProductExtendedProps)[]).map((key) => (
          <div key={key} className={styles.propsRow}>
            <dt className={styles.propsLabel}>{LABELS[key]}</dt>
            <dd className={styles.propsValue}>{props[key] ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

