import fastify, { FastifyInstance } from 'fastify';
import type { StorageType } from '../lib/types/storage';
import '../lib/types/fastify';
import type { ICacheOptions } from '../lib/types/lcache';
import lcache from '../lib/lcache';

const defaultOptions = { ttl: 1 };

const getSimpleApp = (options: ICacheOptions = {}) => {
  const port = 3333;
  const address = '0.0.0.0';
  const app = fastify();
  app.register(lcache, { ...defaultOptions, ...options });

  app.after(() => {
    app.get('/ping', async (_req, reply) => {
      reply.send('pong');
    });
  });
  app.listen(port, address);

  return app;
};

describe('cache', () => {
  const storageTypes: StorageType[] = ['tmp', 'persistence'];
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  test.each(storageTypes)('plugin exists on app instance %p', async () => {
    app = await getSimpleApp();
    expect(app.hasDecorator('lcache')).toBeTruthy();
  });

  test('MapStorage (default) is working', async () => {
    app = await getSimpleApp();
    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async () => app.inject({
      method: 'GET',
      path: '/ping',
    });

    const res1 = await getPing();
    expect(res1.body).toBe('pong');

    const res2 = await getPing();
    expect(res2.body).toBe('pong');
    expect(spy).toHaveBeenCalled();
  });

  test('DirStorage is working', async () => {
    app = await getSimpleApp({ storageType: 'persistence' });
    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async () => app.inject({
      method: 'GET',
      path: '/ping',
    });

    const res1 = await getPing();
    expect(res1.body).toBe('pong');

    const res2 = await getPing();
    expect(res2.body).toBe('pong');
    expect(spy).toHaveBeenCalled();
  });
});
