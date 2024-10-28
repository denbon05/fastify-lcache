import type { IStorage, IStorageOptions } from './storage';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ICachePluginOptions extends IStorageOptions {
  methodsToCache: Set<RequestMethod>;
  statusesToCache: Set<number>;
  excludeRoutes: Set<string>;
}

export interface ICacheOptions {
  /** Specify is plugin should be disabled
   * @default false
   */
  disableCache?: boolean;

  /** Time to live - remove cached data after a certain time specified in minutes
   * @default 5
   */
  ttlInMinutes?: number;

  /** HTTP methods for which cache is applied
   * @default ['GET']
   */
  methodsToCache?: RequestMethod[];

  /** Response statuses which should be cached
   * @default [200]
   */
  statusesToCache?: number[];

  /** Routes which should be ignored by lcache plugin
   * @default []
   */
  excludeRoutes?: string[];
}

export interface ILightCache {
  /**
   * Internal storage instance
   */
  storage: IStorage;

  /**
   * Get cached data
   */
  get<T>(key: string): T | undefined;

  /**
   * Set data to cache.
   */
  set<T>(key: string, value: T): void;

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
