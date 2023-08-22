/* eslint-disable import/prefer-default-export */
import type { FastifyRequest } from 'fastify';
import type {
  RequestMethod,
  ICacheOptions,
  ICachePluginOptions,
} from './types/lcache';

const getMilliseconds = (min: number): number => min * 60000;

export const formatOptions = (opts: ICacheOptions): ICachePluginOptions => ({
  ...opts,
  methodsToCache: new Set(opts.methodsToCache),
  statusesToCache: new Set(opts.statusesToCache),
  excludeRoutes: new Set(opts.excludeRoutes?.map((r) => r.trim())),
  ttl: getMilliseconds(opts.ttlInMinutes),
});

export const shouldBeCached = (
  opts: ICachePluginOptions,
  request: FastifyRequest,
  statusCode: number
): boolean => {
  const { methodsToCache, statusesToCache, excludeRoutes } = opts;
  const { routerPath, method } = request;

  return (
    methodsToCache.has(method as RequestMethod) &&
    statusesToCache.has(statusCode) &&
    !excludeRoutes.has(routerPath)
  );
};
