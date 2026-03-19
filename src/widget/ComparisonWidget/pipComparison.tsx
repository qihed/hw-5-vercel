'use client';

import { createRoot } from 'react-dom/client';
import type RootStore from 'store/RootStore';
import { StoreContext } from 'store/StoreContext';
import { ComparisonWidgetPiPContent } from './ComparisonWidgetPiPContent';

export function isPiPSupported(): boolean {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
}

type PiPAPI = {
  requestWindow: (o?: { width?: number; height?: number; disallowReturnToOpener?: boolean }) => Promise<Window>;
};

export async function openComparisonInPiP(store: RootStore): Promise<void> {
  const w = window as Window & { documentPictureInPicture?: PiPAPI };
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
      <ComparisonWidgetPiPContent
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        onClose={() => pipWindow.close()}
      />
    </StoreContext.Provider>
  );

  const cleanup = () => {
    root.unmount();
  };

  pipWindow.addEventListener('pagehide', cleanup);
  pipWindow.addEventListener('unload', cleanup);
}

