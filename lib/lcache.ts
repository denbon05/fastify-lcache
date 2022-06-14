import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import type {
  Src, SrcMeta, IStorageOptions,
} from './types/storage';

const getMilliseconds = (min: number): number => min * 60000;

const formatOptions = (opts: IStorageOptions): IStorageOptions => ({
  ttl: getMilliseconds(opts.ttl),
});

export class Storage {
  private src: Src = new Map();

  private options: IStorageOptions = {
    ttl: getMilliseconds(5),
  };

  private srcMeta: SrcMeta = new Map();

  private intervalId: ReturnType<typeof setInterval>;

  private initCacheCleaner() {
    this.intervalId = setInterval(() => {
      this.srcMeta.forEach(({ updatedAt }, key) => {
        const date = new Date();
        const isTtlOutdate = date.getTime() - updatedAt.getTime() > this.options.ttl;
        if (isTtlOutdate) {
          this.src.delete(key);
        }
      });
    }, this.options.ttl);
  }

  public constructor(options: IStorageOptions = {}) {
    this.options = { ...this.options, ...options };
    this.initCacheCleaner();
  }

  public get(key: string) {
    return this.src.get(key);
  }

  public set(key: string, value: unknown) {
    this.src.set(key, value);
    this.srcMeta.set(key, { updatedAt: new Date() });
  }

  public has(key: string) {
    return this.src.has(key);
  }

  public destroy() {
    clearInterval(this.intervalId);
  }
}

const cache: FastifyPluginCallback<IStorageOptions> = (
  instance: FastifyInstance,
  opts: IStorageOptions,
  next,
) => {
  const storage = new Storage(formatOptions(opts));

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

  next();
};

export default fp(cache, {
  name: '@fastify/lcache',
  fastify: '3.x',
});
