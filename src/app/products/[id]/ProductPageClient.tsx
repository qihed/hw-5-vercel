'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import type { Product } from 'api/types';
import { ProductPageStore } from './ProductPageStore';
import { ProductPageStoreProvider } from './ProductPageContext';

import styles from './product-page.module.scss';
import Text from 'components/Text';
import ProductCardList from 'components/ProductCardList';
import SkeletonCard from 'components/Skeleton';
import ProductDetails from './components/ProductDetails';

type ProductPageClientProps = {
  initialProduct: Product;
};

const ProductPageClient = observer(({ initialProduct }: ProductPageClientProps) => {
  const router = useRouter();
  const pageStore = useMemo(() => new ProductPageStore(), []);

  useEffect(() => {
    pageStore.setProduct(initialProduct);
    pageStore.loadSimilar(3);
    return () => pageStore.destroy();
  }, [initialProduct, pageStore]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/products');
  };

  return (
    <ProductPageStoreProvider store={pageStore}>
        <div className={styles.container}>
          <button type="button" className={styles.backButton} onClick={handleBack}>
            <Image
              className={`${styles.start} ${styles.block}`}
              src="/right-arrow.png"
              alt="arrow nav"
              width={24}
              height={24}
            />
            <Text view="p-20">Назад</Text>
          </button>
          <ProductDetails />
          <Text className={styles.text}>Total products</Text>
          <div className={styles.field}>
            {pageStore.loadingSimilar ? (
              <div className={styles.skeletonSingle}>
                <SkeletonCard />
              </div>
            ) : (
              <ProductCardList
                products={pageStore.similarProducts}
                loading={pageStore.loadingSimilar}
                error={pageStore.errorSimilar}
              />
            )}
          </div>
        </div>
      </ProductPageStoreProvider>
  );
});

ProductPageClient.displayName = 'ProductPageClient';

export default ProductPageClient;
