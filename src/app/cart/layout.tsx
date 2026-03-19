'use client';

import styles from './cart-page.module.scss';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className={styles.container}>{children}</main>
    </>
  );
}
