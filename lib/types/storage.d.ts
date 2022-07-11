/* eslint-disable no-underscore-dangle */
export interface IStorageOptions {
  ttl?: number;
}

export type StorageType = 'tmp' | 'persistence';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StorageSrc = Map<string, any>;

export interface CachedResponse<T> {
  payload: T;
  headers?: { [key: string]: string | number | string[]; };
  statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Src = Map<string, CachedResponse<any>>;
export type SrcMeta = Map<string, { updatedAt: number; }>;

export type DataStorageType = 'data' | 'meta';

export interface IStorage {
  get<T>(key: string): CachedResponse<T>;

  set<T>(key: string, value: CachedResponse<T>): void;

  has(key: string): boolean;

  reset(key?: string): void;

  destroy(): Promise<void>;

  setup(): Promise<void>;
}
