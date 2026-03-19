'use client';

import { useCallback, useEffect, useState } from 'react';
import { getProducts } from 'api/products';
import type { Product } from 'api/types';
import { INBOX_FOLDER_ID } from 'store/FavoritesStore';
import { useStore } from 'store/StoreContext';
import { useFavoritesPageStore } from './stores/favoritesPageStore';

export function useFavoritesPageModel() {
  const { favorites, cart } = useStore();
  const page = useFavoritesPageStore();
  const [productsById, setProductsById] = useState<Record<number, Product | null>>({});

  const folders = favorites.folders;
  const folderIds = folders.map((folder) => folder.id);
  const folderIdsKey = folderIds.join(',');

  useEffect(() => {
    page.syncSelectedFolder(folderIds);
  }, [folderIds, folderIdsKey, page]);

  const activeFolderId = page.selectedFolderId || INBOX_FOLDER_ID;

  const productIds = favorites.getProductIdsByFolder(activeFolderId);
  const productIdsKey = productIds.join(',');
  const loadingProducts = favorites.hydrated && productIds.some((id) => !(id in productsById));

  useEffect(() => {
    if (!favorites.hydrated || productIds.length === 0) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      getProducts({ productIds, pageSize: productIds.length })
        .then((res) => {
          if (cancelled) return;
          const map: Record<number, Product | null> = {};
          productIds.forEach((id) => {
            map[id] = null;
          });
          res.data.forEach((p) => {
            map[p.id] = p;
          });
          setProductsById((prev) => ({ ...prev, ...map }));
        })
        .catch(() => {
          if (cancelled) return;
          const map: Record<number, Product | null> = {};
          productIds.forEach((id) => {
            map[id] = null;
          });
          setProductsById((prev) => ({ ...prev, ...map }));
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [favorites.hydrated, productIds, productIdsKey]);

  const orderedProducts = productIds
    .map((id) => productsById[id])
    .filter((product): product is Product => product != null);
  const missingProductsCount = productIds.length - orderedProducts.length;

  const submitCreateFolder = useCallback(() => {
    page.submitCreateFolder((name) => favorites.createFolder(name));
  }, [favorites, page]);

  const moveProductToFolder = useCallback(
    (productId: number, folderId: string) => {
      favorites.moveToFolder(productId, folderId);
      page.closeMoveMenu();
    },
    [favorites, page]
  );

  const addProductToCart = useCallback(
    (productId: number) => {
      cart.addItem(productId, 1);
      page.triggerCartBounce(productId);
    },
    [cart, page]
  );

  return {
    page,
    hydrated: favorites.hydrated,
    folders,
    selectedFolderId: activeFolderId,
    setSelectedFolderId: page.setSelectedFolderId.bind(page),
    submitCreateFolder,
    loadingProducts,
    products: orderedProducts,
    missingProductsCount,
    getFolderIdByProduct: favorites.getFolderIdByProduct.bind(favorites),
    removeFolder: favorites.removeFolder.bind(favorites),
    moveToFolder: moveProductToFolder,
    removeFavorite: favorites.remove.bind(favorites),
    addToCart: addProductToCart,
    getCartQuantity: cart.getQuantity.bind(cart),
  };
}
