"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import Text from "components/Text";
import CartIcon from "icons/CartIcon";
import CompareIcon from "icons/CompareIcon";
import ProfileIcon from "icons/ProfileIcon";
import styles from "components/Header/Header.module.scss";
import { useStore } from "@/src/store/StoreContext";
import { observer } from "mobx-react-lite";

const navItems = [
  { href: "/products", label: "Products", active: (pathname: string) => pathname.startsWith("/products") },
  { href: "/categories", label: "Categories", active: (pathname: string) => pathname.startsWith("/categories") },
  { href: "/about", label: "About us", active: (pathname: string) => pathname.startsWith("/about") },
];

const Header = ({ logoOnly = false }: { logoOnly?: boolean }) => {
  const pathname = usePathname();
  const store = useStore();
  const { cart, auth, comparisonWidget } = store;
  const [hydrated, setHydrated] = useState(false);
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
            {navItems.map((item) => {
              const active = item.active(pathname);
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  <Link href={item.href} className={styles.navLink}>
                    <motion.div className={styles.navLinkInner}>
                      <Text
                        view="p-16"
                        className={cn(styles.text, active && styles.textAccent)}
                      >
                        {item.label}
                      </Text>
                      <span
                        className={cn(styles.navHoverLine, active && styles.navHoverLineActive)}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className={styles.actionBtn}>
            <div className={styles.comparePromo}>
              <span className={styles.comparePromoText}>New! Try it if you&apos;re a business →</span>
              <div className={styles.compareWrap}>
              <motion.button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  if (comparisonWidget.isOverlay) {
                    comparisonWidget.close();
                    return;
                  }
                  comparisonWidget.openPiP();
                }}
                data-comparison-trigger="true"
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
              </div>
            </div>
            {hydrated && auth.isAuth ? (
              <>
                <div className={styles.bagWrapper}>
                  <motion.div
                    whileHover={{ y: -1, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
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
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ y: -1, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  <Link href="/profile" className={styles.profileLink} aria-label="Профиль">
                    <ProfileIcon width={24} height={24} color="primary" />
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/login" className={styles.authBtnLogin}>
                    Log in
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -1, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/registration" className={styles.authBtnRegister}>
                    Registration
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default observer(Header);
