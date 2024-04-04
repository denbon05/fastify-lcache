import type { IStorageOptions } from './storage';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ICachePluginOptions extends IStorageOptions {
  methodsToCache?: Set<RequestMethod>;
  statusesToCache?: Set<number>;
  excludeRoutes?: Set<string>;
}

export interface ICacheOptions<> {
  disableCache?: boolean;
  /** Time to live in minutes */
  ttlInMinutes?: number;
  /** HTTP methods for caching */
  methodsToCache?: RequestMethod[];
  /** Statuses with which response data will be cached */
  statusesToCache?: number[];
  /** List of excluded routes where cache won't be applied */
  excludeRoutes?: string[];
  /** Should cache persist on restart the app? */
  shouldPersist?: boolean;
}
