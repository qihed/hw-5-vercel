import styles from './FavoritesItemSkeleton.module.scss';

export default function FavoritesItemSkeleton() {
  return (
    <div className={styles.item} aria-hidden>
      <div className={`${styles.image} ${styles.pulse}`} />

      <div className={styles.details}>
        <div className={`${styles.title} ${styles.pulse}`} />
        <div className={`${styles.category} ${styles.pulse}`} />
        <div className={`${styles.price} ${styles.pulse}`} />
      </div>

      <div className={styles.actions}>
        <div className={`${styles.button} ${styles.pulse}`} />
        <div className={`${styles.remove} ${styles.pulse}`} />
        <div className={styles.selectWrap}>
          <div className={`${styles.selectLabel} ${styles.pulse}`} />
          <div className={`${styles.select} ${styles.pulse}`} />
        </div>
      </div>
    </div>
  );
}
