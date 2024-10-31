import type { FastifyRequest } from 'fastify';
import type {
  ICacheOptions,
  ICachePluginOptions,
  RequestMethod,
} from './types/lcache';

const getMilliseconds = (min: number): number => min * 60000;

export const formatOptions = (
  opts: Required<ICacheOptions>
): ICachePluginOptions => ({
  // options as is
  ...opts,
  // modified options goes below
  methodsToCache: new Set(opts.methodsToCache),
  statusesToCache: new Set(opts.statusesToCache),
  excludeRoutes: new Set(opts.excludeRoutes?.map((route) => route.trim())),
  ttlInMs: getMilliseconds(opts.ttlInMinutes),
});

export const shouldDataBeCached = (
  opts: ICachePluginOptions,
  request: FastifyRequest,
  statusCode: number
): boolean => {
  const { methodsToCache, statusesToCache, excludeRoutes } = opts;
  const { method, routeOptions } = request;

  return (
    methodsToCache.has(method as RequestMethod) &&
    statusesToCache.has(statusCode) &&
    !!routeOptions.url &&
    !excludeRoutes.has(routeOptions.url)
  );
};
