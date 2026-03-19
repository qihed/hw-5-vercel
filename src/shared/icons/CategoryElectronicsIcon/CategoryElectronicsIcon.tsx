import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CategoryElectronicsIcon: React.FC<IconProps> = ({
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
      <rect x="6" y="8" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 23H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 20V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default CategoryElectronicsIcon;
