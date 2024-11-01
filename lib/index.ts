import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import * as constants from "./constants";
import { LightCache } from "./models/LightCache";
import MapStorage from "./models/MapStorage";
import type { ICacheOptions } from "./types/lcache";
import * as utils from "./utils";

// all default options goes here
const defaultOpts: Required<ICacheOptions> = {
  ttlInMinutes: constants.TTL_IN_MINUTES,
  statusesToCache: constants.STATUSES_TO_CACHE,
  methodsToCache: constants.METHODS_TO_CACHE,
  excludeRoutes: [],
  disableCache: false,
  includeRoutes: "*",
};

const cache: FastifyPluginCallback<ICacheOptions> = (
  instance: FastifyInstance,
  // eslint-disable-next-line default-param-last
  opts: ICacheOptions = {},
  next
) => {
  const pluginOpts = utils.formatOptions({ ...defaultOpts, ...opts });

  const storage = new MapStorage({
    ttlInMs: pluginOpts.ttlInMs,
  });

  instance.addHook("onSend", async (request, reply, payload) => {
    if (opts.disableCache) {
      // no need to proceed
      return;
    }

    const cacheKey = utils.buildCacheKey(request);
    const shouldValueBeCached =
      !storage.has(cacheKey) &&
      utils.shouldDataBeCached(
        { ...pluginOpts, statusCode: reply.statusCode },
        request
      );

    if (shouldValueBeCached) {
      storage.set(cacheKey, {
        payload,
        headers: reply.getHeaders(),
        statusCode: reply.statusCode,
      });
    }
  });

  instance.addHook("onRequest", async (request, reply) => {
    const cacheKey = utils.buildCacheKey(request);

    if (storage.has(cacheKey)) {
      const { headers, payload, statusCode } = storage.get(cacheKey);
      // prepare reply and send saved payload
      if (headers) {
        reply.headers(headers);
      }
      if (statusCode) {
        reply.status(statusCode);
      }
      reply.send(payload);
    }
  });

  instance.addHook("onClose", (_instance, done) => {
    storage.destroy();
    done();
  });

  const lcacheInstance = new LightCache(storage);
  instance.decorate("lcache", lcacheInstance);

  next();
};

const lcache = fp(cache, {
  name: "@fastify/lcache",
  fastify: ">=4.10",
});

/**
 * Cache plugin for Fastify
 */
export default lcache;
