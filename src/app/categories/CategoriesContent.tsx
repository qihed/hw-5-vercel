'use client';

import type * as React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import Text from 'components/Text';
import type { ProductCategory } from 'api/types';
import CategoryElectronicsIcon from 'icons/CategoryElectronicsIcon';
import CategoryFurnitureIcon from 'icons/CategoryFurnitureIcon';
import CategoryShoesIcon from 'icons/CategoryShoesIcon';
import CategoryMiscIcon from 'icons/CategoryMiscIcon';
import styles from './categories-page.module.scss';
import { motion } from 'framer-motion';

type CategoriesContentProps = {
  categories: ProductCategory[];
};

const getCategoryIcon = (category: ProductCategory): React.ReactNode => {
  const source = `${category.slug ?? ''} ${category.name ?? ''}`.trim().toLowerCase();

  if (source.includes('electr')) {
    return <CategoryElectronicsIcon />;
  }

  if (source.includes('furnitur')) {
    return <CategoryFurnitureIcon />;
  }

  if (source.includes('shoe')) {
    return <CategoryShoesIcon />;
  }

  if (source.includes('misc')) {
    return <CategoryMiscIcon />;
  }

  const fallbackName =
    (typeof category.name === 'string' && category.name.trim()) ||
    (typeof category.slug === 'string' && category.slug.trim()) ||
    `Category ${category.id}`;

  return <span className={styles.categoryInitial}>{fallbackName.charAt(0).toUpperCase()}</span>;
};

const CategoriesContent = observer(({ categories }: CategoriesContentProps) => (
  <>
    <motion.main
      className={styles.main}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.hero}>
        <Text view="title">Categories</Text>
        <Text view="p-20" color="secondary" className={styles.heroText}>
          Browse products by category to find exactly what you&apos;re looking for
        </Text>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {categories.map((category) => {
            const name =
              (typeof category.name === 'string' && category.name.trim()) ||
              (typeof category.slug === 'string' && category.slug.trim()) ||
              `Category ${category.id}`;

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>{getCategoryIcon(category)}</div>
                <span className={styles.categoryName}>{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.main>
  </>
));

CategoriesContent.displayName = 'CategoriesContent';

export default CategoriesContent;
