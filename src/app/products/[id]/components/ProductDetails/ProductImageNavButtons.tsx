import styles from './product-details.module.scss';

type Props = {
  className?: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function ProductImageNavButtons({
  className,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className={[styles.galleryNav, className].filter(Boolean).join(' ')} aria-label="Image navigation">
      <button
        type="button"
        className={styles.galleryNavButton}
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous image"
        title="Previous"
      >
        ‹
      </button>
      <button
        type="button"
        className={styles.galleryNavButton}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next image"
        title="Next"
      >
        ›
      </button>
    </div>
  );
}
