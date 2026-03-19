'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useStore } from 'store/StoreContext';
import { loadComparisonProducts, saveComparisonProducts } from '../../adapters/comparisonStorage';
import { COMPARISON_MAX_PRODUCTS } from 'store/ComparisonStore';
import { isPiPSupported, openComparisonPiP, type PiPSession } from '../../adapters/pipAdapter';
import { ComparisonWidgetOverlay } from '../ComparisonWidgetOverlay/ComparisonWidgetOverlay';
import type { Product } from 'api/types';
import type { ComparisonWidgetMode } from '../../model/types';
import styles from './ComparisonWidgetHost.module.scss';

function closePipSession(session: PiPSession | null) {
  try {
    session?.close();
  } catch {
    // ignore
  }
}

export const ComparisonWidgetHost = observer(function ComparisonWidgetHost() {
  const store = useStore();
  const { comparison, productProps, comparisonWidget } = store;

  const mode = comparisonWidget.mode;
  const productsKey = comparison.products.map((p) => p.documentId).join('|');

  const pipSessionRef = useRef<PiPSession | null>(null);
  const openAttemptIdRef = useRef(0);

  useEffect(() => {
    const initial = loadComparisonProducts(COMPARISON_MAX_PRODUCTS);
    if (initial.length > 0) {
      comparison.products = initial;
    }
  }, [comparison]);

  useEffect(() => {
    const disposer = reaction(
      () => comparison.products.map((p) => p.documentId),
      () => {
        saveComparisonProducts(comparison.products);
      },
    );
    return () => disposer();
  }, [comparison]);

  const onAddProduct = useCallback(
    (product: Product) => {
      const docId = product.documentId;
      if (comparison.hasProduct(docId)) return;
      if (comparison.count >= COMPARISON_MAX_PRODUCTS) return;
      productProps.ensureForProduct(product);
      comparison.addProduct(product);
    },
    [comparison, productProps],
  );

  const onRemoveProduct = useCallback((documentId: string) => {
    comparison.removeProduct(documentId);
  }, [comparison]);

  const onClear = useCallback(() => {
    comparison.clear();
  }, [comparison]);

  const onRequestClose = useCallback(() => {
    comparisonWidget.close();
  }, [comparisonWidget]);

  useLayoutEffect(() => {
    if (comparisonWidget.mode === 'closed') return;
    productProps.ensureForProducts(comparison.products);
  }, [comparisonWidget.mode, comparison.products, productsKey, productProps]);

  useEffect(() => {
    const currentMode: ComparisonWidgetMode = mode;

    if (currentMode === 'closed') {
      closePipSession(pipSessionRef.current);
      pipSessionRef.current = null;
      return;
    }

    if (currentMode === 'overlay') {
      closePipSession(pipSessionRef.current);
      pipSessionRef.current = null;
      return;
    }

    openAttemptIdRef.current += 1;
    const openId = openAttemptIdRef.current;

    const run = async () => {
      closePipSession(pipSessionRef.current);
      pipSessionRef.current = null;

      if (!isPiPSupported()) {
        if (openAttemptIdRef.current === openId) {
          comparisonWidget.openOverlay();
        }
        return;
      }

      try {
        const baseUrl = window.location.origin;
        const session = await openComparisonPiP({
          store,
          baseUrl,
          onClose: () => {
            comparisonWidget.close();
            closePipSession(pipSessionRef.current);
          },
          onAddProduct,
          onRemoveProduct,
          onClear,
          onClosed: () => {
            if (openAttemptIdRef.current !== openId) return;
            if (comparisonWidget.mode !== 'pip') return;
            comparisonWidget.close();
          },
        });

        if (openAttemptIdRef.current !== openId || comparisonWidget.mode !== 'pip') {
          session.close();
          return;
        }

        pipSessionRef.current = session;
      } catch {
        if (openAttemptIdRef.current === openId && comparisonWidget.mode === 'pip') {
          comparisonWidget.openOverlay();
        }
      }
    };

    void run();
  }, [mode, comparisonWidget, onAddProduct, onClear, onRemoveProduct, store]);

  const overlay = mode === 'overlay';

  return (
    <div className={styles.host}>
      <ComparisonWidgetOverlay
        isOpen={overlay}
        onClose={onRequestClose}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
        onClear={onClear}
      />
    </div>
  );
});

