import ContentLoader from 'react-content-loader';
import styles from './products-page.module.scss';

const BACKGROUND_COLOR = '#fafafa';
const FOREGROUND_COLOR = '#518581';

function ProductCardSkeleton() {
  return (
    <ContentLoader
      speed={2}
      width={280}
      height={360}
      viewBox="0 0 280 360"
      backgroundColor={BACKGROUND_COLOR}
      foregroundColor={FOREGROUND_COLOR}
    >
      <rect x="0" y="0" width="280" height="200" rx="8" />
      <rect x="0" y="220" width="120" height="14" rx="4" />
      <rect x="0" y="250" width="280" height="16" rx="4" />
      <rect x="0" y="274" width="240" height="14" rx="4" />
      <rect x="0" y="310" width="80" height="24" rx="4" />
      <rect x="200" y="310" width="80" height="36" rx="8" />
    </ContentLoader>
  );
}

export default function ProductsLoading() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <div className={styles.loadingWrap}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
