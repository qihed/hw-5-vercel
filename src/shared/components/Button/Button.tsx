'use client';

import React from 'react';
import cn from 'classnames';
import { motion } from 'framer-motion';
import styles from 'components/Button/Button.module.scss';
import Loader from 'components/Loader';

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

export type ButtonProps = Omit<MotionButtonProps, 'children' | 'onClick' | 'disabled'> & {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  loading,
  disabled,
  onClick,
  ...rest
}) => {
  const isDisabled = Boolean(disabled || loading);

  const classNames = cn(
    styles.textButton,
    styles.button,
    { [styles.buttonLoading]: loading },
    className
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  return (
    <motion.button
      {...rest}
      disabled={isDisabled}
      onClick={handleClick}
      className={classNames}
      whileHover={!isDisabled ? { y: -2 } : undefined}
      whileTap={!isDisabled ? { y: 0, scale: 0.99 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {loading && <Loader className={styles.loaderWhite} size="s" />}
      {children}
    </motion.button>
  );
};

export default Button;
