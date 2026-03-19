'use client';

import { useState } from 'react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/src/store/StoreContext';
import { createDropZoneHandlers } from 'lib/dragDrop';
import { getProductImageUrl, getProductCategoryName, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import { getProductExtendedProps } from 'lib/productExtendedProps';
import { ProductPropsPopover } from './ProductPropsPopover';
import type { Product } from 'api/types';

function getComparisonTitle(products: Product[]): string {
  if (products.length === 0) return 'Сравнение';
  const props = getProductExtendedProps(products[0]);
  return props.company ? `Сравнение с ${props.company}` : 'Сравнение';
}

const BRAND = '#518581';
const FONT_HOVER = '#afadb5';
const BORDER = '#f3f3f3';
const DISABLED = '#d9d9d9';

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden' as const,
    background: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: `2px solid ${BORDER}`,
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    lineHeight: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: FONT_HOVER,
    borderRadius: 8,
  },
  dropZone: {
    margin: '8px 12px',
    padding: 10,
    border: `2px dashed ${DISABLED}`,
    borderRadius: 6,
    textAlign: 'center' as const,
  },
  dropHint: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: BRAND,
  },
  dropSub: {
    display: 'block',
    fontSize: 11,
    color: FONT_HOVER,
    marginTop: 2,
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0 20px 16px',
  },
  empty: {
    fontSize: 14,
    color: FONT_HOVER,
    textAlign: 'center' as const,
    padding: '24px 0',
    margin: 0,
  },
  clearBtn: {
    margin: '12px 20px 16px',
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: FONT_HOVER,
    background: '#f5f5f5',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 0',
    borderBottom: `1px solid ${BORDER}`,
  },
  itemLink: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0,
    textDecoration: 'none',
    color: 'inherit',
  },
  itemImage: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: 4,
    overflow: 'hidden' as const,
    background: DISABLED,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  itemCategory: { fontSize: 11, color: FONT_HOVER },
  itemTitle: {
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  itemPrice: { fontSize: 14, fontWeight: 600, color: BRAND },
  characteristicsBtn: {
    marginTop: 4,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 12,
    color: BRAND,
    textDecoration: 'underline',
  },
  removeBtn: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    lineHeight: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: FONT_HOVER,
    borderRadius: 4,
  },
};

export type ComparisonWidgetPiPContentProps = {
  baseUrl: string;
  onClose: () => void;
};

const ComparisonWidgetPiPContent = observer(({ baseUrl }: ComparisonWidgetPiPContentProps) => {
  const { comparison } = useStore();

  const dropHandlers = createDropZoneHandlers<Product>((product) => comparison.addProduct(product), ['product']);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>{getComparisonTitle(comparison.products)}</h2>
      </div>

      <div {...dropHandlers} style={s.dropZone}>
        <span style={s.dropHint}>Перетащите товар сюда</span>
        <span style={s.dropSub}>
          Скиньте товары, затем перейдите на сайт конкурента и убедитесь, что мы лучше — окно останется поверх
        </span>
      </div>

      <div style={s.list}>
        {comparison.products.length === 0 ? (
          <p style={s.empty}>Нет товаров для сравнения</p>
        ) : (
          comparison.products.map((product) => (
            <ComparisonItemPiP
              key={product.documentId}
              product={product}
              baseUrl={baseUrl}
              onRemove={() => comparison.removeProduct(product.documentId)}
            />
          ))
        )}
      </div>

      {comparison.products.length > 0 && (
        <button type="button" onClick={() => comparison.clear()} style={s.clearBtn}>
          Очистить сравнение
        </button>
      )}
    </div>
  );
});

const sExpanded = {
  item: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    gap: 0,
    padding: '12px 0',
    borderBottom: `1px solid ${BORDER}`,
  },
  imageFull: {
    width: '100%',
    aspectRatio: '1',
    flexShrink: 0,
    borderRadius: 4,
    overflow: 'hidden' as const,
    background: DISABLED,
  },
  infoRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, paddingTop: 8 },
  infoBlock: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: 2 },
  collapseRow: { display: 'flex', justifyContent: 'center', marginTop: 4 },
};

const ComparisonItemPiP = observer(
  ({ product, baseUrl, onRemove }: { product: Product; baseUrl: string; onRemove: () => void }) => {
    const [showProps, setShowProps] = useState(false);
    const imageUrl = getProductImageUrl(product) || DEFAULT_PRODUCT_IMAGE;
    const category = getProductCategoryName(product);
    const extendedProps = getProductExtendedProps(product);

    if (showProps) {
      return (
        <div style={sExpanded.item}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <a
              href={`${baseUrl}/products/${product.documentId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ ...sExpanded.imageFull, position: 'relative' as const }}>
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 400px) 100vw, 400px"
                />
              </div>
            </a>
            <div style={sExpanded.infoRow}>
              <a
                href={`${baseUrl}/products/${product.documentId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
              >
                <div style={sExpanded.infoBlock}>
                  {category && <span style={s.itemCategory}>{category}</span>}
                  <span style={s.itemTitle}>{product.title}</span>
                  <span style={s.itemPrice}>{product.price}₽</span>
                </div>
              </a>
              <button type="button" onClick={onRemove} aria-label="Удалить из сравнения" style={s.removeBtn}>
                ×
              </button>
            </div>
            <ProductPropsPopover props={extendedProps} onClose={() => setShowProps(false)} block inline />
            <div style={sExpanded.collapseRow}>
              <button
                type="button"
                style={s.characteristicsBtn}
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
      <div style={s.item}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <a
            href={`${baseUrl}/products/${product.documentId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={s.itemLink}
          >
            <div style={{ ...s.itemImage, position: 'relative' as const }}>
              <Image src={imageUrl} alt={product.title} fill style={{ objectFit: 'cover' }} sizes="64px" />
            </div>
            <div style={s.itemInfo}>
              {category && <span style={s.itemCategory}>{category}</span>}
              <span style={s.itemTitle}>{product.title}</span>
              <span style={s.itemPrice}>{product.price}₽</span>
            </div>
          </a>
          <button
            type="button"
            style={s.characteristicsBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowProps(true);
            }}
          >
            Характеристики
          </button>
        </div>
        <button type="button" onClick={onRemove} aria-label="Удалить из сравнения" style={s.removeBtn}>
          ×
        </button>
      </div>
    );
  }
);

export { ComparisonWidgetPiPContent };

