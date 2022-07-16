import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import type { ICacheOptions } from './types/lcache';
import { formatOptions, shouldBeCached } from './helpers';
import MapStorage from './storage/Map';

const defaultOpts: ICacheOptions = {
  ttlInMinutes: 5,
  statusesToCache: [200],
  methodsToCache: ['GET'],
};

const cache: FastifyPluginCallback<ICacheOptions> = (
  instance: FastifyInstance,
  opts: ICacheOptions,
  _next,
) => {
  if (opts.disableCache) {
    _next();
    return;
  }

  const storageOpts = formatOptions({ ...defaultOpts, ...opts });

  const storage = new MapStorage(storageOpts);

  instance.addHook('onSend', async (request, reply, payload) => {
    const { url, method } = request;
    const requestId = url + method;

    if (
      !storage.has(requestId)
      && shouldBeCached(storageOpts, request, reply.statusCode)
    ) {
      storage.set(requestId, {
        payload,
        headers: reply.getHeaders(),
        statusCode: reply.statusCode,
      });
    }
  });

  instance.addHook('onRequest', async ({ url, method }, reply) => {
    const requestId = url + method;

    if (storage.has(requestId)) {
      const { headers, payload, statusCode } = storage.get(requestId);
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

/**
 * Cache plugin for Fastify
 */
export default fp(cache, {
  name: '@fastify/lcache',
  fastify: '3.x',
});
