import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import type { ICacheOptions } from './types/lcache';
import { formatOptions } from './helpers';
import storages from './storages';

const defaultOpts: ICacheOptions = {
  ttl: 5,
  storageType: 'Map',
};

const cache: FastifyPluginCallback<ICacheOptions> = (
  instance: FastifyInstance,
  opts: ICacheOptions,
  _next,
) => {
  const pluginOpts = formatOptions({ ...defaultOpts, ...opts });
  const Storage = storages[pluginOpts.storageType];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { storageType, ...storageOpts } = pluginOpts;
  const storage = new Storage(storageOpts);

  instance.addHook('onSend', async ({ url }, _reply, payload) => {
    if (!storage.has(url)) {
      storage.set(url, payload);
    }
  });
  instance.addHook('onRequest', async ({ url }, reply) => {
    if (storage.has(url)) {
      reply.send(storage.get(url));
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
