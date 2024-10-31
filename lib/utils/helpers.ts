import type { BuildCacheKeyParam } from '@/types/cached-key';
import { createHash } from 'node:crypto';
import type { FormattedOps, ICacheOptions } from '../types/lcache';

const getMilliseconds = (min: number): number => min * 60000;

export const wildcardToRegExp = (pattern: string) =>
  new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);

export const formatOptions = (opts: Required<ICacheOptions>): FormattedOps => ({
  // options as is
  ...opts,
  // modified options goes below
  methodsToCache: new Set(opts.methodsToCache),
  statusesToCache: new Set(opts.statusesToCache),
  excludeRoutes: opts.excludeRoutes.map((route) => route.trim()),
  ttlInMs: getMilliseconds(opts.ttlInMinutes),
  includeRoutes:
    opts.includeRoutes === '*'
      ? '*'
      : opts.includeRoutes.map((route) => route.trim()),
});

const hashValue = (text: unknown): string =>
  createHash('sha256').update(JSON.stringify(text)).digest('hex');

export const buildCacheKey = ({
  url,
  method,
  body,
  query,
}: BuildCacheKeyParam) => {
  // try to get payload in order to specify request cache key
  const payload = body || query || '';

  return `${url}-${method}-${hashValue(payload)}`;
};
