import * as React from 'react';
import cn from 'classnames';
import type { IconProps } from 'icons/Icon';
import styles from 'icons/Icon/Icon.module.scss';

const TagIcon: React.FC<IconProps> = ({ className, color, width = 18, height = 18, ...rest }) => {
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
      <path d="M20.6 7.4l-5-5a2 2 0 0 0-2.8 0L2.8 12.4a2 2 0 0 0 0 2.8l5 5a2 2 0 0 0 2.8 0l9.9-9.9a2 2 0 0 0 0-2.9z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );
};

export default TagIcon;

