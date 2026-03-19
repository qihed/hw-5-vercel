import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CartEmptyIcon: React.FC<IconProps> = ({ className, color, width = 28, height = 28, ...rest }) => {
  const COLOR_STYLE_MAP: Record<NonNullable<IconProps['color']>, string> = {
    primary: styles.iconPrimary,
    secondary: styles.iconSecondary,
    accent: styles.iconAccent,
  };

  return (
    <svg
      {...rest}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(styles.icon, color && COLOR_STYLE_MAP[color], className)}
    >
      <path d="M6.5 6h15l-1.4 7.2a2 2 0 0 1-2 1.6H8a2 2 0 0 1-2-1.6L4.6 3.5A2 2 0 0 0 2.7 2H2" />
      <path d="M9 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 21Z" fill="currentColor" stroke="none" />
      <path d="M18 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 18 21Z" fill="currentColor" stroke="none" />
    </svg>
  );
};

export default CartEmptyIcon;

