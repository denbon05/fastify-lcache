/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IStorageOptions {
  ttl?: number;
  ttlCheckIntervalMs?: number;
}

export type StorageWatcherMethod = 'interval' | 'timeout';

export type Src = Map<string, any>;
export type SrcMeta = Map<string, { updatedAt: number }>;

export interface IStorage {
  /**
   * Get cached data
   */
  get(key: string): any;

  /**
   * Set data to cache
   */
  set(key: string, value: any): void;

  /**
   * Check if data exists in cache
   */
  has(key: string): boolean;

  /**
   * Clear all data in cache if key not specified
   * @param key? string
   */
  reset(key?: string | string[]): void;

  /**
   * Clear Interval which check data lifetime
   */
  destroy(): void;
}
