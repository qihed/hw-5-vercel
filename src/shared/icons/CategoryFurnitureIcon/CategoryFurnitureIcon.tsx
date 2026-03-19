import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CategoryFurnitureIcon: React.FC<IconProps> = ({
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
        d="M7 17.5V14.5C7 13.4 7.9 12.5 9 12.5H21C22.1 12.5 23 13.4 23 14.5V17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 17.5H24V20C24 20.6 23.6 21 23 21H7C6.4 21 6 20.6 6 20V17.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8.5 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21.5 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default CategoryFurnitureIcon;
