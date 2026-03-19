'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Product, ProductCategory } from 'api/types';
import styles from './products-page.module.scss';
import Description from './components/Description';
import TechInfo from './components/TechInfo';
import ProductCardList from 'components/ProductCardList';
import Text from 'components/Text';
import Nav from './components/Nav';

export type ProductsContentProps = {
  products: Product[];
  total: number;
  pageCount: number;
  currentPage: number;
  categories: ProductCategory[];
  searchQuery: string;
  categoryIds: number[];
  priceMin: number | undefined;
  priceMax: number | undefined;
  categoryParam: string | null;
  minPriceParam: string | null;
  maxPriceParam: string | null;
};

function getCategoryOptions(categories: ProductCategory[]) {
  return categories.map((cat) => {
    const displayName =
      (typeof cat.name === 'string' && cat.name.trim()) ||
      (typeof cat.slug === 'string' && cat.slug.trim()) ||
      `Category ${cat.id}`;
    return { key: String(cat.id), value: displayName };
  });
}

export default function ProductsContent({
  products,
  total,
  pageCount,
  currentPage,
  categories,
  searchQuery,
  categoryIds,
  priceMin,
  priceMax,
  categoryParam,
  minPriceParam,
  maxPriceParam,
}: ProductsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryOptions = getCategoryOptions(categories);
  const hasFilters =
    searchQuery.trim() || categoryIds.length > 0 || priceMin != null || priceMax != null;
  const isPageOutOfRange = pageCount > 0 && currentPage > pageCount;

  const applySearchParams = (updater: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    updater(next);
    next.set('page', '1');
    router.replace(`${pathname}?${next.toString()}`);
  };

  const handleSearchSubmit = (value: string) => {
    applySearchParams((next) => {
      if (value.trim()) next.set('search', value.trim());
      else next.delete('search');
    });
  };

  const handleCategoryChange = (ids: number[]) => {
    applySearchParams((next) => {
      if (ids.length) next.set('category', ids.join(','));
      else next.delete('category');
    });
  };

  const handleClearSearch = () => {
    applySearchParams((next) => next.delete('search'));
  };

  const handleClearCategory = () => {
    applySearchParams((next) => next.delete('category'));
  };

  const handlePriceChange = (min: number | undefined, max: number | undefined) => {
    applySearchParams((next) => {
      if (min != null && min > 0) next.set('minPrice', String(min));
      else next.delete('minPrice');
      if (max != null && max > 0) next.set('maxPrice', String(max));
      else next.delete('maxPrice');
    });
  };

  const handleClearPrice = () => {
    applySearchParams((next) => {
      next.delete('minPrice');
      next.delete('maxPrice');
    });
  };

  return (
    <>
      <main className={styles.main}>
        <Description />
        <TechInfo
          total={total}
          loading={false}
          searchValue={searchQuery}
          onSearchSubmit={handleSearchSubmit}
          selectedCategoryIds={categoryIds}
          onCategoryChange={handleCategoryChange}
          onClearSearch={handleClearSearch}
          onClearCategory={handleClearCategory}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceChange={handlePriceChange}
          onClearPrice={handleClearPrice}
          categoryOptions={categoryOptions}
        />
        <div className={styles.mainContent}>
          {isPageOutOfRange ? (
            <div className={styles.emptySearch}>
              <Text view="title">This page does not exist</Text>
            </div>
          ) : products.length === 0 && hasFilters ? (
            <div className={styles.emptySearch}>
              <Text view="title">No products match your filters</Text>
            </div>
          ) : (
            <ProductCardList
              products={products}
              loading={false}
              error={null}
            />
          )}
        </div>
        <nav className={styles.paginationWrap} aria-label="Pagination">
          <Nav
            currentPage={currentPage}
            pageCount={pageCount}
            searchQuery={searchQuery}
            categoryParam={categoryParam}
            minPrice={minPriceParam}
            maxPrice={maxPriceParam}
          />
        </nav>
      </main>
    </>
  );
}
