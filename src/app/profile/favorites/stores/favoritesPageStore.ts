'use client';

import { makeAutoObservable } from 'mobx';
import { useState } from 'react';
import { INBOX_FOLDER_ID } from 'store/FavoritesStore';

export class FavoritesPageStore {
  isCreatingFolder = false;
  newFolderName = '';
  selectedFolderId = INBOX_FOLDER_ID;
  folderInputFocusKey = 0;
  openedMoveMenuProductId: number | null = null;
  cartBounceTokenByProductId = new Map<number, number>();

  constructor() {
    makeAutoObservable(this);
  }

  setIsCreatingFolder(value: boolean) {
    this.isCreatingFolder = value;
  }

  setNewFolderName(value: string) {
    this.newFolderName = value;
  }

  setSelectedFolderId(value: string) {
    this.selectedFolderId = value;
  }

  startCreateFolder() {
    this.isCreatingFolder = true;
    this.folderInputFocusKey += 1;
  }

  cancelCreateFolder() {
    this.newFolderName = '';
    this.isCreatingFolder = false;
  }

  submitCreateFolder(createFolder: (name: string) => void) {
    const normalized = this.newFolderName.trim();
    if (!normalized) {
      this.cancelCreateFolder();
      return;
    }
    createFolder(normalized);
    this.newFolderName = '';
    this.isCreatingFolder = false;
  }

  syncSelectedFolder(folderIds: string[]) {
    if (folderIds.includes(this.selectedFolderId)) return;
    this.selectedFolderId = INBOX_FOLDER_ID;
  }

  get canSubmitFolder() {
    return this.newFolderName.trim().length > 0;
  }

  toggleMoveMenu(productId: number) {
    this.openedMoveMenuProductId = this.openedMoveMenuProductId === productId ? null : productId;
  }

  closeMoveMenu() {
    this.openedMoveMenuProductId = null;
  }

  triggerCartBounce(productId: number) {
    this.cartBounceTokenByProductId.set(productId, Date.now());
  }
}

export function useFavoritesPageStore() {
  const [store] = useState(() => new FavoritesPageStore());
  return store;
}
