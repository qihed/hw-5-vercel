'use client';

import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import FavoriteIcon from 'icons/FavoriteIcon';
import { useStore } from 'store/StoreContext';
import styles from './FavoriteToggleButton.module.scss';

export type FavoriteToggleButtonProps = {
  productId: number;
  className?: string;
  stopLinkNavigation?: boolean;
};

const stopLink = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const FavoriteToggleButton = ({ productId, className, stopLinkNavigation = false }: FavoriteToggleButtonProps) => {
  const { favorites } = useStore();
  const isFavorite = favorites.hydrated && favorites.isFavorite(productId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopLinkNavigation) stopLink(e);
    favorites.toggle(productId);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopLinkNavigation) stopLink(e);
  };

  return (
    <button
      type="button"
      className={cn(styles.button, isFavorite && styles.active, className)}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <FavoriteIcon filled={isFavorite} />
    </button>
  );
};

export default observer(FavoriteToggleButton);
