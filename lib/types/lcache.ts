import type { InjectOptions } from "fastify";
import type { IStorageOptions } from "./storage";

export type RequestMethod = InjectOptions["method"];

export interface ICachePluginOptions extends IStorageOptions {
  methodsToCache: Set<RequestMethod>;
  statusesToCache: Set<number>;
  excludeRoutes: string[];
  includeRoutes: "*" | string[];
  statusCode: number;
}

export type CompileRoutePatternsParam = Pick<
  Required<ICachePluginOptions>,
  "includeRoutes" | "excludeRoutes"
>;

export type ShouldCacheRouteParam = {
  route: string;
} & {
  includePatterns: RegExp[];
  excludePatterns: RegExp[];
};

export type FormattedOps = Omit<ICachePluginOptions, "statusCode">;

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

  /** The matched routes will never be cached
   * regardless of any `includeRoutes` setting
   * @default []
   *
   * @example
   * // Scenario 1: includeRoutes: '*' with specific excludeRoutes
   * // Behavior: All routes are cached except '/auth/*' and '/admin/*'
   * {
   *   includeRoutes: '*',
   *   excludeRoutes: ['/auth/*', '/admin/*']
   * }
   *
   * // Scenario 2: Specific Routes for includeRoutes and excludeRoutes
   * // Behavior: Only '/api/users' and '/api/orders' are cached, and '/api/secret' is ignored
   * {
   *   includeRoutes: ['/api/users', '/api/orders']
   *   excludeRoutes: ['/api/secret'],
   * }
   */
  excludeRoutes?: string[];

  /** Routes that should be included for caching by the lcache plugin.
   * By default all routes included for caching.
   * When specified particular routes, only those are
   * cached, while all other routes are ignored by the cache.
   * @note `excludeRoutes` has a priority over this option
   * @default '*'
   *
   * @example
   * // Scenario 1: includeRoutes: '*' with specific excludeRoutes
   * // Behavior: All routes are cached except '/auth/*' and '/admin/*'
   * {
   *   includeRoutes: '*',
   *   excludeRoutes: ['/auth/*', '/admin/*']
   * }
   *
   * // Scenario 2: Specific Routes for includeRoutes and excludeRoutes
   * // Behavior: Only '/api/users' and '/api/orders' are cached, and '/api/secret' is ignored
   * {
   *   includeRoutes: ['/api/users', '/api/orders']
   *   excludeRoutes: ['/api/secret'],
   * }
   */
  includeRoutes?: "*" | string[];
}

export interface ILightCache {
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
