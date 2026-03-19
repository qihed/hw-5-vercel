import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CategoryShoesIcon: React.FC<IconProps> = ({
  className,
  color,
  width = 30,
  height = 30,
  ...rest
}) => {
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
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, color && COLOR_STYLE_MAP[color], className)}
    >
      <path
        d="M6 19.5H24V21C24 21.8 23.3 22.5 22.5 22.5H7.5C6.7 22.5 6 21.8 6 21V19.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 19.5L12.8 19.5C14.3 19.5 15.8 19.1 17.1 18.4L18.2 17.8C18.8 17.5 19.5 17.6 20 18L21 18.7C21.4 19 21.9 19.2 22.5 19.2H24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M10 16.2L12 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default CategoryShoesIcon;
