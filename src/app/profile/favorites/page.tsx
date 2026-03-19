'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'framer-motion';
import Text from 'components/Text';
import Button from 'components/Button';
import TrashIcon from 'icons/TrashIcon';
import { DEFAULT_PRODUCT_IMAGE, getProductCategoryName, getProductImageUrl } from 'api/products';
import styles from './favorites-page.module.scss';
import { useFavoritesPageModel } from './useFavoritesPageModel';
import FavoritesItemSkeleton from './components/FavoritesItemSkeleton';
import { INBOX_FOLDER_ID } from 'store/FavoritesStore';

const FavoritesPage = () => {
  const {
    page,
    hydrated,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    submitCreateFolder,
    loadingProducts,
    products,
    missingProductsCount,
    getFolderIdByProduct,
    removeFolder,
    moveToFolder,
    removeFavorite,
    addToCart,
    getCartQuantity,
  } = useFavoritesPageModel();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!page.isCreatingFolder) return;
    inputRef.current?.focus();
  }, [page.folderInputFocusKey, page.isCreatingFolder]);

  const handleStartCreateFolder = () => {
    page.startCreateFolder();
  };

  const handleSubmitCreateFolder = () => {
    submitCreateFolder();
  };

  const isEmpty = !loadingProducts && products.length === 0;

  return (
    <div className={styles.container}>
      <Text view="title" tag="h1" className={styles.title}>
        Favorites
      </Text>

      <div className={styles.foldersPanel}>
        <div className={styles.folderTabs}>
          <motion.button
            type="button"
            className={styles.addFolderBtn}
            onClick={handleStartCreateFolder}
            aria-label="Create folder"
            title="Create folder"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            +
          </motion.button>

          {folders.map((folder) => (
            <div key={folder.id} className={styles.folderTabWrap}>
              <motion.button
                type="button"
                className={`${styles.folderTab} ${selectedFolderId === folder.id ? styles.folderTabActive : ''}`}
                onClick={() => setSelectedFolderId(folder.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {folder.name}
              </motion.button>
              {folder.id !== INBOX_FOLDER_ID && (
                <button
                  type="button"
                  className={styles.folderDeleteBtn}
                  aria-label={`Delete folder ${folder.name}`}
                  title={`Delete folder ${folder.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFolder(folder.id);
                  }}
                >
                  <TrashIcon width={14} height={14} />
                </button>
              )}
            </div>
          ))}

          <AnimatePresence initial={false}>
            {page.isCreatingFolder && (
              <motion.input
                key="folder-create-input"
                ref={inputRef}
                type="text"
                value={page.newFolderName}
                onChange={(e) => page.setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className={styles.folderInputInline}
                onBlur={handleSubmitCreateFolder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitCreateFolder();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    page.cancelCreateFolder();
                  }
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {!hydrated || loadingProducts ? (
        <div className={styles.items}>
          <FavoritesItemSkeleton />
        </div>
      ) : isEmpty ? (
        <div className={styles.empty}>
          <Text view="p-20" weight="bold" tag="p">
            No products in this folder
          </Text>
          <Text view="p-16" color="secondary" tag="p">
            Add products to favorites and organize them into folders.
          </Text>
          <Link href="/products" className={styles.backLink}>
            <Button type="button">Browse products</Button>
          </Link>
        </div>
      ) : (
        <>
          {missingProductsCount > 0 && (
            <Text view="p-14" color="secondary" className={styles.missingInfo}>
              Some products are no longer available.
            </Text>
          )}

          <motion.div layout className={styles.items}>
            <AnimatePresence initial={false}>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  className={styles.item}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={
                    page.cartBounceTokenByProductId.get(product.id)
                      ? { opacity: 1, y: [0, -8, 0], scale: [1, 1.01, 1] }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={{ opacity: 0, x: 72 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                <Link href={`/products/${product.documentId}`} className={styles.imageWrap}>
                  <Image
                    src={getProductImageUrl(product) || DEFAULT_PRODUCT_IMAGE}
                    alt={product.title}
                    fill
                    sizes="80px"
                    className={styles.image}
                  />
                </Link>

                <div className={styles.details}>
                  <Link href={`/products/${product.documentId}`} className={styles.itemTitleLink}>
                    <Text view="p-16" weight="medium">
                      {product.title}
                    </Text>
                  </Link>
                  {getProductCategoryName(product) && (
                    <Text view="p-14" color="secondary">
                      {getProductCategoryName(product)}
                    </Text>
                  )}
                  <Text view="p-16" weight="bold">
                    {product.price.toFixed(2)} ₽
                  </Text>
                </div>

                <div className={styles.actions}>
                  {getCartQuantity(product.id) <= 0 && (
                    <Button type="button" onClick={() => addToCart(product.id)}>
                      Add to cart
                    </Button>
                  )}
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFavorite(product.id)}
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    <TrashIcon />
                  </button>
                  <div className={styles.selectWrap}>
                    <span className={styles.selectLabel}>Move to folder</span>
                    <motion.button
                      type="button"
                      className={styles.select}
                      onClick={() => page.toggleMoveMenu(product.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{folders.find((f) => f.id === getFolderIdByProduct(product.id))?.name || 'Inbox'}</span>
                      <span className={styles.selectChevron}>▾</span>
                    </motion.button>
                    <AnimatePresence>
                      {page.openedMoveMenuProductId === product.id && (
                        <motion.div
                          className={styles.dropdown}
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                        >
                          {folders.map((folder) => (
                            <motion.button
                              key={folder.id}
                              type="button"
                              className={`${styles.dropdownItem} ${
                                getFolderIdByProduct(product.id) === folder.id ? styles.dropdownItemActive : ''
                              }`}
                              onClick={() => moveToFolder(product.id, folder.id)}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {folder.name}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default observer(FavoritesPage);
