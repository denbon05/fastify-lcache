import type {
  CompileRoutePatternsParam,
  ICachePluginOptions,
  RequestMethod,
  ShouldCacheRouteParam,
} from '@/types/lcache';
import type { FastifyRequest } from 'fastify';
import { wildcardToRegExp } from './helpers';

export const shouldCacheRoute = ({
  includePatterns,
  excludePatterns,
  route,
}: ShouldCacheRouteParam): boolean => {
  if (excludePatterns.some((pattern) => pattern.test(route))) {
    return false;
  }

  return includePatterns.some((pattern) => pattern.test(route));
};

/** Precompile patterns from includeRoutes and excludeRoutes */
export const compileRoutePatterns = ({
  includeRoutes,
  excludeRoutes,
}: CompileRoutePatternsParam) => {
  const includePatterns =
    includeRoutes === '*'
      ? [/.*/] // Match all routes if includeRoutes is '*'
      : includeRoutes.map(wildcardToRegExp);

  const excludePatterns = excludeRoutes.map(wildcardToRegExp);

  return { includePatterns, excludePatterns };
};

export const shouldDataBeCached = (
  {
    methodsToCache,
    statusesToCache,
    excludeRoutes,
    includeRoutes,
    statusCode,
  }: ICachePluginOptions,
  request: FastifyRequest
): boolean => {
  const { method, routeOptions } = request;
  const routePatterns = compileRoutePatterns({ excludeRoutes, includeRoutes });

  const shouldRouteBeCached =
    !!routeOptions.url &&
    shouldCacheRoute({
      ...routePatterns,
      route: routeOptions.url,
    });

  return (
    methodsToCache.has(method as RequestMethod) &&
    statusesToCache.has(statusCode) &&
    shouldRouteBeCached
  );
};
