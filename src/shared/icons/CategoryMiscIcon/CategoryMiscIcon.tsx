import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CategoryMiscIcon: React.FC<IconProps> = ({
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
      <circle cx="9" cy="15" r="1.7" fill="currentColor" />
      <circle cx="15" cy="15" r="1.7" fill="currentColor" />
      <circle cx="21" cy="15" r="1.7" fill="currentColor" />
    </svg>
  );
};

export default CategoryMiscIcon;
