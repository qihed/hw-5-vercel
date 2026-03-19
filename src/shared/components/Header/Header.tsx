"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import Text from "components/Text";
import CartIcon from "icons/CartIcon";
import CompareIcon from "icons/CompareIcon";
import ProfileIcon from "icons/ProfileIcon";
import ComparisonWidget from "widget/ComparisonWidget";
import { WidgetStore } from "widget/store";
import styles from "components/Header/Header.module.scss";
import { useStore } from "@/src/store/StoreContext";
import { observer } from "mobx-react-lite";

const Header = ({ logoOnly = false }: { logoOnly?: boolean }) => {
  const pathname = usePathname();
  const store = useStore();
  const { cart, auth } = store;
  const [widgetStore] = useState(() => new WidgetStore(store));
  const [hydrated, setHydrated] = useState(false);
  const compareTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  const items = cart.items;
  const totalCount = cart.totalCount;

  return (
    <header className={`${styles.header} ${logoOnly ? styles.headerLogoOnly : ""}`}>
      {logoOnly ? (
        <div className={styles.logoFrame}>
          <Image src="/Frame.svg" alt="" width={42} height={42} aria-hidden />
          <Image src="/Lalasia.svg" alt="Lalasia" width={77} height={19} />
        </div>
      ) : (
        <Link href="/products" className={styles.logoFrame}>
          <Image src="/Frame.svg" alt="" width={42} height={42} aria-hidden />
          <Image src="/Lalasia.svg" alt="Lalasia" width={77} height={19} />
        </Link>
      )}

      {!logoOnly && (
        <>
          <div className={styles.namePages}>
            <Link href="/products" className={styles.navLink}>
              <Text
                view="p-16"
                className={cn(styles.text, pathname.startsWith('/products') && styles.textAccent)}
              >
                Products
              </Text>
            </Link>
            <Link href="/categories" className={styles.navLink}>
              <Text
                view="p-16"
                className={cn(styles.text, pathname.startsWith('/categories') && styles.textAccent)}
              >
                Categories
              </Text>
            </Link>
            <Link href="/about" className={styles.navLink}>
              <Text
                view="p-16"
                className={cn(styles.text, pathname.startsWith('/about') && styles.textAccent)}
              >
                About us
              </Text>
            </Link>
          </div>
          <div className={styles.actionBtn}>
            <div className={styles.comparePromo}>
              <span className={styles.comparePromoText}>New! Try it if you&apos;re a business →</span>
              <div className={styles.compareWrap}>
              <motion.button
                ref={compareTriggerRef}
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  widgetStore.openComparisonPreferPiP();
                }}
                aria-label="Сравнение товаров"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <CompareIcon width={24} height={24} />
                <AnimatePresence>
                  {hydrated && (
                    <motion.span
                      className={styles.iconBadgeNew}
                      initial={{ opacity: 0, y: -2, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -2, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      NEW
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <ComparisonWidget
                isOpen={widgetStore.comparisonWidgetOpen}
                onClose={() => widgetStore.closeComparisonWidget()}
                triggerRef={compareTriggerRef}
              />
              </div>
            </div>
            {hydrated && auth.isAuth ? (
              <>
                <div className={styles.bagWrapper}>
                  <Link
                    href="/profile/cart"
                    className={styles.bagLink}
                    aria-label="Корзина"
                  >
                    <CartIcon width={24} height={24} />

                    <AnimatePresence initial={false}>
                      {items.length !== 0 && (
                        <motion.span
                          key={totalCount}
                          className={styles.iconBadge}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        >
                          {totalCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
                <Link href="/profile" className={styles.profileLink} aria-label="Профиль">
                  <ProfileIcon width={24} height={24} color="primary" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.authBtnLogin}>
                  Log in
                </Link>
                <Link href="/registration" className={styles.authBtnRegister}>
                  Registration
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default observer(Header);
