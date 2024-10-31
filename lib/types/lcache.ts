import type { IStorageOptions } from './Storage';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ICachePluginOptions extends IStorageOptions {
  methodsToCache?: Set<RequestMethod>;
  statusesToCache?: Set<number>;
  excludeRoutes?: Set<string>;
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

  /** How often check the outdated cached data in ms
   * @since v2.1.0
   * @experimental
   * By default removes data based on the timeout between cached keys
   */
  ttlCheckIntervalMs?: number;
}
