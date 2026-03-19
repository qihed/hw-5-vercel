import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const PinIcon: React.FC<IconProps> = ({ className, color, width = 18, height = 18, ...rest }) => {
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
      <path d="M12 21s-7-4.4-7-11a7 7 0 0 1 14 0c0 6.6-7 11-7 11z" />
      <path d="M12 10.2a2.3 2.3 0 1 0 0 .1z" />
    </svg>
  );
};

export default PinIcon;

