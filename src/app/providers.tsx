'use client';

import { useEffect } from 'react';
import { runInAction } from 'mobx';
import 'config/configureMobX';
import { StoreProvider, useStore } from 'store/StoreContext';
import { useQueryParamsStoreInit } from 'hooks/useQueryParamsStoreInit';
import { getToken, getStoredUser } from 'api/auth';

function AuthInit() {
  const { auth } = useStore();
  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      runInAction(() => {
        auth.user = user;
      });
    }
  }, [auth]);
  return null;
}

function CartInit() {
  const { cart } = useStore();
  useEffect(() => {
    if (getToken()) {
      cart.load();
    }
  }, [cart]);
  return null;
}

function FavoritesInit() {
  const { favorites } = useStore();
  useEffect(() => {
    favorites.hydrate();
  }, [favorites]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthInit />
      <CartInit />
      <FavoritesInit />
      {children}
    </StoreProvider>
  );
}

export function QueryParamsSync() {
  useQueryParamsStoreInit();
  return null;
}
