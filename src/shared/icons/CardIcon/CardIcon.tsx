import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const CardIcon: React.FC<IconProps> = ({ className, color, width = 18, height = 18, ...rest }) => {
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(styles.icon, color && COLOR_STYLE_MAP[color], className)}
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
    </svg>
  );
};

export default CardIcon;

