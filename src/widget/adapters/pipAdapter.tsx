'use client';

import { createRoot } from 'react-dom/client';
import type RootStore from 'store/RootStore';
import { StoreContext } from 'store/StoreContext';
import type { Product } from 'api/types';
import { ComparisonWidgetPiPSurface } from '../ui/ComparisonWidgetPiPSurface/ComparisonWidgetPiPSurface';

export function isPiPSupported(): boolean {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
}

export type PiPSession = {
  close: () => void;
};

export type OpenComparisonPiPOptions = {
  store: RootStore;
  baseUrl: string;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (documentId: string) => void;
  onClear: () => void;
  onClosed: () => void;
};

function copyDocumentStyles(sourceDoc: Document, targetDoc: Document): void {
  const nodes = sourceDoc.querySelectorAll('style, link[rel="stylesheet"]');
  nodes.forEach((node) => {
    targetDoc.head.appendChild(node.cloneNode(true));
  });
}

export async function openComparisonPiP(options: OpenComparisonPiPOptions): Promise<PiPSession> {
  const { store, baseUrl, onAddProduct, onRemoveProduct, onClear, onClosed, onClose } = options;

  const w = window as Window & {
    documentPictureInPicture?: {
      requestWindow: (o?: { width?: number; height?: number; disallowReturnToOpener?: boolean }) => Promise<Window>;
    };
  };

  if (!w.documentPictureInPicture) {
    throw new Error('Document Picture-in-Picture не поддерживается в этом браузере.');
  }

  const pipWindow = await w.documentPictureInPicture.requestWindow({
    width: 360,
    height: 600,
    disallowReturnToOpener: false,
  });

  const doc = pipWindow.document;
  doc.documentElement.lang = 'ru';
  doc.body.innerHTML = '';
  doc.head.innerHTML = '';
  copyDocumentStyles(window.document, doc);
  doc.body.style.margin = '0';
  doc.body.style.padding = '0';
  doc.body.style.fontFamily = "'Roboto', sans-serif";
  doc.body.style.overflow = 'hidden';
  doc.body.style.display = 'flex';
  doc.body.style.flexDirection = 'column';
  doc.body.style.height = '100vh';

  const rootEl = doc.createElement('div');
  rootEl.style.flex = '1';
  rootEl.style.minHeight = '0';
  rootEl.style.overflow = 'auto';
  doc.body.appendChild(rootEl);

  const root = createRoot(rootEl);
  root.render(
    <StoreContext.Provider value={store}>
      <ComparisonWidgetPiPSurface
        baseUrl={baseUrl}
        onClose={() => {
          onClose();
          // actual closing is handled by host/pipWindow lifecycle
        }}
        onAddProduct={onAddProduct}
        onRemoveProduct={onRemoveProduct}
        onClear={onClear}
      />
    </StoreContext.Provider>,
  );

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    pipWindow.removeEventListener('pagehide', cleanup);
    pipWindow.removeEventListener('unload', cleanup);
    root.unmount();
    onClosed();
  };

  pipWindow.addEventListener('pagehide', cleanup);
  pipWindow.addEventListener('unload', cleanup);

  return {
    close: () => {
      try {
        pipWindow.close();
      } catch {
        // ignore
      } finally {
        cleanup();
      }
    },
  };
}

