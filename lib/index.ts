import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import type { ICacheOptions } from '@/types/lcache';
import { formatOptions, shouldBeCached } from '@/helpers';
import MapStorage from '@/storage/Map';
import { buildCacheKey } from '@/utils';

const defaultOpts: ICacheOptions = {
  ttlInMinutes: 5,
  statusesToCache: [200],
  methodsToCache: ['GET'],
};

const cache: FastifyPluginCallback<ICacheOptions> = (
  instance: FastifyInstance,
  opts: ICacheOptions,
  _next
) => {
  if (opts.disableCache) {
    _next();
    return;
  }

  const storageOpts = formatOptions({ ...defaultOpts, ...opts });

  const storage = new MapStorage(storageOpts);

  instance.addHook('onSend', async (request, reply, payload) => {
    const cacheKey = buildCacheKey(request);

    if (
      !storage.has(cacheKey) &&
      shouldBeCached(storageOpts, request, reply.statusCode)
    ) {
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
