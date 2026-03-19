'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useParams } from 'next/navigation';
import Button from 'components/Button';
import Text from 'components/Text';
import CartQuantityControl from 'components/CartQuantityControl';
import FavoriteToggleButton from 'components/FavoriteToggleButton';
import Link from 'next/link';
import ShareButton from 'components/ShareButton';
import styles from './product-details.module.scss';
import { getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from 'api/products';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';
import { useProductPageStore } from '../../ProductPageContext';
import { createOrderFromItems } from 'lib/ordersStorage';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import ProductImageNavButtons from './ProductImageNavButtons';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

type PaymentCard = {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand?: string;
  isDefault?: boolean;
  createdAt?: number;
};

const PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v2';
const LEGACY_PAYMENT_CARDS_STORAGE_KEY = 'profile.paymentCards.v1';

function safeReadPaymentCards(): PaymentCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw =
      window.localStorage.getItem(PAYMENT_CARDS_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_PAYMENT_CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is PaymentCard => Boolean(x && typeof x === 'object'))
      .map((x) => x as PaymentCard)
      .filter((c) => typeof c.id === 'string' && typeof c.last4 === 'string')
      .slice(0, 20);
  } catch {
    return [];
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const ProductDetails = () => {
  const router = useRouter();
  const params = useParams();
  const [buyingNow, setBuyingNow] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const id = params?.id as string | undefined;
  const store = useProductPageStore();
  const product = store.product;
  const error = store.errorProductId;
  const loading =
    store.loadingProductId ||
    (id != null && (store.product == null || String(store.product.documentId) !== String(id)));

  const imageUrls = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];
    const urls = (product.images ?? [])
      .map((img) => img?.url)
      .filter((u): u is string => typeof u === 'string' && u.length > 0);
    if (urls.length > 0) return urls;
    const fallback = getProductImageUrl(product);
    return [fallback ?? DEFAULT_PRODUCT_IMAGE];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    swiper?.slideTo(0, 0);
  }, [product?.id, swiper]);

  const imageUrl = imageUrls[Math.min(activeImageIndex, imageUrls.length - 1)] ?? DEFAULT_PRODUCT_IMAGE;
  const canGoPrev = activeImageIndex > 0;
  const canGoNext = activeImageIndex < imageUrls.length - 1;

  const paginateImage = (direction: number) => {
    if (!swiper) return;
    if (direction > 0) {
      swiper.slideNext();
      return;
    }
    swiper.slidePrev();
  };

  const sortedCards = useMemo(() => {
    return cards
      .slice()
      .sort(
        (a, b) =>
          Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
          Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      );
  }, [cards]);

  useEffect(() => {
    if (!payOpen) return;
    setPayError(null);
    const nextCards = safeReadPaymentCards();
    setCards(nextCards);
    const defaultCard = nextCards.find((c) => c.isDefault) ?? nextCards[0];
    setSelectedCardId(defaultCard?.id ?? '');
  }, [payOpen]);

  if (error) {
    return (
      <div className={styles.container}>
        <p>Ошибка загрузки: {error.message}</p>
      </div>
    );
  }

  const handleBuyNow = () => {
    setPayOpen(true);
  };

  const handlePay = async () => {
    setPayError(null);
    if (!product) {
      setPayError('Product is not available.');
      return;
    }
    if (!selectedCardId) {
      setPayError('Select a card to continue.');
      return;
    }

    setPaying(true);
    setBuyingNow(true);
    try {
      await wait(900);
      const ok = Math.random() < 0.9;
      if (!ok) {
        setPayError('Payment failed. Please try again.');
        return;
      }

      createOrderFromItems([
        {
          name: product.title,
          quantity: 1,
          price: product.price,
          image: imageUrl,
        },
      ]);
      setPayOpen(false);
      toast.success('Payment was successful.');
      router.push('/profile/orders');
    } finally {
      setPaying(false);
      setBuyingNow(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ProductDetailsSkeleton />
        </motion.div>
      ) : !product ? (
        <motion.div
          key="missing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className={styles.container}>
            <p>Товар не найден</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className={styles.container}>
            <motion.div
              className={styles.imgItem}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Swiper
                key={product.id}
                className={styles.gallerySwiper}
                slidesPerView={1}
                allowTouchMove={imageUrls.length > 1}
                onSwiper={setSwiper}
                onSlideChange={(instance) => setActiveImageIndex(instance.activeIndex)}
              >
                {imageUrls.map((url, index) => (
                  <SwiperSlide key={`${product.id}:${index}`}>
                    <div className={styles.gallerySlide}>
                      <Image
                        src={url}
                        alt={product.title}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 375px, 600px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {imageUrls.length > 1 && (
                <>
                  <ProductImageNavButtons
                    canGoPrev={canGoPrev}
                    canGoNext={canGoNext}
                    onPrev={() => paginateImage(-1)}
                    onNext={() => paginateImage(1)}
                  />
                  <div className={styles.galleryDots} aria-label="Image pagination">
                    {imageUrls.map((_, index) => (
                      <button
                        key={`${product.id}:dot:${index}`}
                        type="button"
                        className={[
                          styles.galleryDot,
                          index === activeImageIndex ? styles.galleryDotActive : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-label={`Go to image ${index + 1}`}
                        aria-current={index === activeImageIndex ? 'true' : undefined}
                        onClick={() => swiper?.slideTo(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              className={styles.info}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut', delay: 0.05 }}
            >
              <div className={styles.text}>
                <Text view="title">{product.title}</Text>
                <Text view="p-20" color="secondary" className={styles.text}>
                  {product.description}
                </Text>
              </div>

              <div className={styles.action}>
                <Text view="title">{product.price}₽</Text>
                <div className={styles.btnFrame}>
                  <Button type="button" onClick={handleBuyNow} disabled={buyingNow}>
                    {buyingNow ? 'Processing...' : 'Buy Now'}
                  </Button>
                  <CartQuantityControl
                    productId={product.id}
                    buttonClassName={styles.btnCart}
                  />
                  <FavoriteToggleButton productId={product.id} className={styles.btnFavorite} />
                  <ShareButton title={product.title} iconOnly />
                </div>
              </div>
            </motion.div>

            {payOpen && (
              <div
                className={styles.payOverlay}
                role="dialog"
                aria-modal="true"
                aria-label="Payment"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget && !paying) setPayOpen(false);
                }}
              >
                <div className={styles.payModal}>
                  <div className={styles.payHeader}>
                    <Text tag="h3" view="p-20" weight="medium">
                      Payment
                    </Text>
                    <button
                      type="button"
                      className={styles.payClose}
                      onClick={() => setPayOpen(false)}
                      disabled={paying}
                      aria-label="Close"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.payBody}>
                    <div className={styles.payProduct}>
                      <div className={styles.payProductImageWrap}>
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          sizes="56px"
                          className={styles.payProductImage}
                        />
                      </div>
                      <div className={styles.payProductInfo}>
                        <Text view="p-16" weight="medium" maxLines={2}>
                          {product.title}
                        </Text>
                        <Text view="p-14" color="secondary">
                          Qty: 1
                        </Text>
                      </div>
                    </div>

                    <div className={styles.payRow}>
                      <Text view="p-16" weight="medium">
                        Total
                      </Text>
                      <Text view="p-16" weight="medium">
                        {product.price}₽
                      </Text>
                    </div>

                    <div className={styles.paySection}>
                      <Text view="p-16" weight="medium">
                        Choose a card
                      </Text>

                      {sortedCards.length === 0 ? (
                        <div className={styles.payEmpty}>
                          <Text view="p-14" color="secondary">
                            You don&apos;t have saved cards yet.
                          </Text>
                          <Link
                            className={styles.payLink}
                            href="/profile/settings"
                            onClick={() => setPayOpen(false)}
                          >
                            Add a card in settings
                          </Link>
                        </div>
                      ) : (
                        <div className={styles.cardList}>
                          {sortedCards.map((c) => (
                            <label key={c.id} className={styles.cardOption}>
                              <input
                                type="radio"
                                name="paymentCard"
                                checked={selectedCardId === c.id}
                                onChange={() => setSelectedCardId(c.id)}
                                disabled={paying}
                              />
                              <span className={styles.cardOptionText}>
                                •••• {c.last4}{' '}
                                <span className={styles.cardOptionMeta}>
                                  {c.expMonth}/{c.expYear?.slice?.(-2)}
                                </span>
                                {c.isDefault && <span className={styles.defaultPill}>Default</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {payError && (
                      <Text view="p-14" className={styles.payError}>
                        {payError}
                      </Text>
                    )}
                  </div>

                  <div className={styles.payFooter}>
                    <Button
                      type="button"
                      className={styles.payCancelButton}
                      onClick={() => setPayOpen(false)}
                      disabled={paying}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handlePay}
                      loading={paying}
                      disabled={sortedCards.length === 0 || !selectedCardId}
                    >
                      Pay now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default observer(ProductDetails);
