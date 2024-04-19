import { checkShouldBeCached, formatOptions } from '@/helpers';
import MapStorage from '@/storage/Map';
import type { ICacheOptions } from '@/types/lcache';
import { buildCacheKey } from '@/utils';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import * as constants from '@/constants';

const defaultOpts: ICacheOptions = {
  ttlInMinutes: constants.TTL_IN_MINUTES,
  statusesToCache: constants.STATUSES_TO_CACHE,
  methodsToCache: constants.METHODS_TO_CACHE,
  ttlCheckIntervalMs: constants.TLL_CHECK_INTERVAL_MS,
};

const cache: FastifyPluginCallback<ICacheOptions> = (
  instance: FastifyInstance,
  opts: ICacheOptions,
  _next
) => {
  const storageOpts = formatOptions({ ...defaultOpts, ...opts });

  const storage = new MapStorage(storageOpts);

  instance.addHook('onSend', async (request, reply, payload) => {
    const cacheKey = buildCacheKey(request);
    const shouldValueBeCached =
      !storage.has(cacheKey) &&
      checkShouldBeCached(storageOpts, request, reply.statusCode) &&
      !opts.disableCache;

    if (shouldValueBeCached) {
      storage.set(cacheKey, {
        payload,
        headers: reply.getHeaders(),
        statusCode: reply.statusCode,
      });
    }
  });

  instance.addHook('onRequest', async (request, reply) => {
    const cacheKey = buildCacheKey(request);

    if (storage.has(cacheKey)) {
      const { headers, payload, statusCode } = storage.get(cacheKey);
      reply.headers(headers);
      reply.status(statusCode);
      reply.send(payload);
    }
  });

  instance.addHook('onClose', (_instance, done) => {
    storage.destroy();
    done();
  });

  instance.decorate('lcache', storage);

  _next();
};

const lcache = fp(cache, {
  name: '@fastify/lcache',
  fastify: '>=4.10',
});

/**
 * Cache plugin for Fastify
 */
export default lcache;
