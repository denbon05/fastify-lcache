export interface IStorageOptions {
  ttl?: number;
}

export interface CachedResponse<T> {
  payload: T;
  headers?: { [key: string]: string | number | string[] };
  statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Src = Map<string, CachedResponse<any>>;
export type SrcMeta = Map<string, { updatedAt: number }>;

export interface IStorage {
  get<T>(key: string): CachedResponse<T>;

  set<T>(key: string, value: CachedResponse<T>): void;

  has(key: string): boolean;

  reset(key?: string): void;

  destroy(): void;
}
