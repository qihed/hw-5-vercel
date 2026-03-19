import { makeAutoObservable } from 'mobx';
import { LocalStorageModel } from './LocalStorageModel';

const STORAGE_KEY = 'favorites.state.v1';
export const INBOX_FOLDER_ID = 'inbox';
export const INBOX_FOLDER_NAME = 'Inbox';

type FavoriteFolder = {
  id: string;
  name: string;
  system?: boolean;
};

type FavoriteItem = {
  productId: number;
  folderId: string;
  addedAt: number;
};

type FavoritesStateV1 = {
  version: 1;
  folders: FavoriteFolder[];
  items: FavoriteItem[];
};

const INBOX_FOLDER: FavoriteFolder = {
  id: INBOX_FOLDER_ID,
  name: INBOX_FOLDER_NAME,
  system: true,
};

function sanitizeFolders(raw: unknown): FavoriteFolder[] {
  if (!Array.isArray(raw)) return [INBOX_FOLDER];

  const result: FavoriteFolder[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const folder = entry as Record<string, unknown>;
    const id = typeof folder.id === 'string' ? folder.id.trim() : '';
    const name = typeof folder.name === 'string' ? folder.name.trim() : '';
    if (!id || !name || seen.has(id)) continue;
    result.push({
      id,
      name,
      system: id === INBOX_FOLDER_ID ? true : Boolean(folder.system),
    });
    seen.add(id);
  }

  if (!seen.has(INBOX_FOLDER_ID)) {
    return [INBOX_FOLDER, ...result];
  }

  return result.map((folder) =>
    folder.id === INBOX_FOLDER_ID ? { ...folder, name: INBOX_FOLDER_NAME, system: true } : folder
  );
}

function sanitizeItems(raw: unknown, folderIds: Set<string>): FavoriteItem[] {
  if (!Array.isArray(raw)) return [];

  const result: FavoriteItem[] = [];
  const seenProductIds = new Set<number>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const productId = typeof item.productId === 'number' ? item.productId : Number(item.productId);
    if (!Number.isFinite(productId) || productId <= 0 || seenProductIds.has(productId)) continue;
    const folderIdRaw = typeof item.folderId === 'string' ? item.folderId.trim() : INBOX_FOLDER_ID;
    const folderId = folderIds.has(folderIdRaw) ? folderIdRaw : INBOX_FOLDER_ID;
    const addedAt = typeof item.addedAt === 'number' ? item.addedAt : Date.now();
    result.push({ productId, folderId, addedAt });
    seenProductIds.add(productId);
  }
  return result;
}

export class FavoritesStore {
  hydrated = false;
  folders: FavoriteFolder[] = [INBOX_FOLDER];
  items: FavoriteItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  hydrate() {
    if (typeof window === 'undefined') return;
    const fallback: FavoritesStateV1 = { version: 1, folders: [INBOX_FOLDER], items: [] };
    const raw = LocalStorageModel.getItemJson<unknown>(STORAGE_KEY, fallback);
    const parsed = (raw ?? {}) as Partial<FavoritesStateV1>;

    const folders = sanitizeFolders(parsed.folders);
    const folderIds = new Set(folders.map((f) => f.id));
    const items = sanitizeItems(parsed.items, folderIds);

    this.folders = folders;
    this.items = items;
    this.hydrated = true;
    this.persist();
  }

  private persist() {
    if (!this.hydrated || typeof window === 'undefined') return;
    const state: FavoritesStateV1 = {
      version: 1,
      folders: this.folders,
      items: this.items,
    };
    LocalStorageModel.setItemJson(STORAGE_KEY, state);
  }

  get totalCount() {
    return this.items.length;
  }

  get userFolders() {
    return this.folders.filter((folder) => folder.id !== INBOX_FOLDER_ID);
  }

  isFavorite(productId: number) {
    return this.items.some((item) => item.productId === productId);
  }

  getProductIdsByFolder(folderId: string) {
    return this.items.filter((item) => item.folderId === folderId).map((item) => item.productId);
  }

  getFolderIdByProduct(productId: number) {
    return this.items.find((item) => item.productId === productId)?.folderId ?? INBOX_FOLDER_ID;
  }

  addToInbox(productId: number) {
    if (!Number.isFinite(productId) || productId <= 0) return;
    if (this.isFavorite(productId)) return;
    this.items.push({
      productId,
      folderId: INBOX_FOLDER_ID,
      addedAt: Date.now(),
    });
    this.persist();
  }

  remove(productId: number) {
    const next = this.items.filter((item) => item.productId !== productId);
    if (next.length === this.items.length) return;
    this.items = next;
    this.persist();
  }

  toggle(productId: number) {
    if (this.isFavorite(productId)) {
      this.remove(productId);
      return;
    }
    this.addToInbox(productId);
  }

  createFolder(name: string) {
    const normalized = name.trim();
    if (!normalized) return;
    const exists = this.folders.some((folder) => folder.name.toLowerCase() === normalized.toLowerCase());
    if (exists) return;

    this.folders.push({
      id: `folder_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: normalized,
      system: false,
    });
    this.persist();
  }

  removeFolder(folderId: string) {
    if (!folderId || folderId === INBOX_FOLDER_ID) return;
    const hasFolder = this.folders.some((folder) => folder.id === folderId);
    if (!hasFolder) return;

    this.items = this.items.map((item) =>
      item.folderId === folderId
        ? {
            ...item,
            folderId: INBOX_FOLDER_ID,
          }
        : item
    );
    this.folders = this.folders.filter((folder) => folder.id !== folderId);
    this.persist();
  }

  moveToFolder(productId: number, folderId: string) {
    const hasFolder = this.folders.some((folder) => folder.id === folderId);
    if (!hasFolder) return;
    this.items = this.items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            folderId,
          }
        : item
    );
    this.persist();
  }
}
