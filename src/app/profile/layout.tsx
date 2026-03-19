'use client';

import { useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import Text from 'components/Text';
import { useStore } from 'store/StoreContext';
import ProfileIcon from 'icons/ProfileIcon';
import OrdersIcon from 'icons/OrdersIcon';
import CartIcon from 'icons/CartIcon';
import FavoriteIcon from 'icons/FavoriteIcon';
import SettingsIcon from 'icons/SettingsIcon';
import LogoutIcon from 'icons/LogoutIcon';
import styles from './layout.module.scss';

const navItems = [
  { href: '/profile', label: 'Profile', icon: 'profile' },
  { href: '/profile/orders', label: 'My Orders', icon: 'orders' },
  { href: '/profile/cart', label: 'Cart', icon: 'cart' },
  { href: '/profile/favorites', label: 'Favorites', icon: 'favorites' },
  { href: '/profile/settings', label: 'Settings', icon: 'settings' },
];

const icons: Record<string, React.ReactNode> = {
  profile: <ProfileIcon width={20} height={20} />,
  orders: <OrdersIcon width={20} height={20} />,
  cart: <CartIcon width={20} height={20} />,
  favorites: <FavoriteIcon width={20} height={20} />,
  settings: <SettingsIcon width={20} height={20} />,
  logout: <LogoutIcon width={20} height={20} />,
};

function getInitials(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '?';
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, auth, favorites } = useStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleLogout = () => {
    auth.logout().then(() => router.replace('/'));
  };

  const isActive = (href: string) => {
    if (href === '/profile') return pathname === '/profile';
    return pathname.startsWith(href);
  };

  const displayName = mounted ? (auth.nickname || '...') : '...';
  const displayEmail = mounted ? (auth.profileEmail || '') : '';
  const initials = mounted ? getInitials(auth.nickname) : '?';

  return (
    <>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>{initials}</span>
            </div>
            <Text view="p-18" weight="medium" className={styles.userName}>
              {displayName}
            </Text>
            <Text view="p-14" color="secondary">
              {displayEmail}
            </Text>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{icons[item.icon]}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.icon === 'cart' && mounted && cart.totalCount > 0 && (
                  <span className={styles.badge}>{cart.totalCount}</span>
                )}
                {item.icon === 'favorites' && mounted && favorites.hydrated && favorites.totalCount > 0 && (
                  <span className={styles.badge}>{favorites.totalCount}</span>
                )}
              </Link>
            ))}

            <button className={styles.navItemLogout} onClick={handleLogout} type="button">
              <span className={styles.navIcon}>{icons.logout}</span>
              <span className={styles.navLabel}>Log out</span>
            </button>
          </nav>
        </aside>

        <main className={styles.content}>{children}</main>
      </div>
    </>
  );
}

export default observer(ProfileLayout);
