import fastify, { FastifyInstance } from 'fastify';
import type { StorageType } from '../lib/types/storage';
import '../lib/types/fastify';
import type { ICacheOptions } from '../lib/types/lcache';
import lcache from '../lib/lcache';

const defaultOptions: ICacheOptions = {
  ttlInMinutes: 2,
  excludeRoutes: [],
  statusesToCache: [200],
};

const getSimpleApp = (options: ICacheOptions = {}) => {
  const app = fastify();
  app.register(lcache, { ...defaultOptions, ...options });

  app.after(() => {
    app.get('/ping', async (_req, reply) => {
      reply.send('pong');
    });

    app.get('/json', async (_req, reply) => {
      reply.send({ hello: 'world' });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.post('/post', async (req: any, reply) => {
      reply.status(201);
      reply.send(req.body.data);
    });

    app.get('/date', async (_req, reply) => {
      setTimeout(() => reply.send(Date.now()), Math.random() * 100);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.put('/put', async (req: any, reply) => {
      reply.status(201).send(req.body.data);
    });
  });

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

  test('temporary storage (default) is working', async () => {
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

  test('persistence storage is working', async () => {
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

  test('Cache should return same headers as the original request', async () => {
    const spy = jest.spyOn(app.lcache, 'get');
    const getJson = async () => app.inject({
      method: 'GET',
      path: '/json',
    });

    const res1 = await getJson();
    const res2 = await getJson();

    expect(res2.headers['content-type']).toBe(res1.headers['content-type']);
    expect(spy).toHaveBeenCalled();
  });
});

describe('Caching with custom options', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await getSimpleApp({ excludeRoutes: ['/date'], statusesToCache: [200, 201] });
  });

  afterEach(async () => {
    await app.close();
  });

  test('POST method should not be cached', async () => {
    const res1 = await app.inject({
      method: 'POST',
      path: '/post',
      payload: {
        data: 'first-payload',
      },
    });

    const res2 = await app.inject({
      method: 'POST',
      path: '/post',
      payload: {
        data: 'second-payload',
      },
    });

    expect(res1.body).not.toBe(res2.body);
  });

  test('Excluded routes should not be cached', async () => {
    const res1 = await app.inject({
      method: 'GET',
      path: '/date',
    });

    const res2 = await app.inject({
      method: 'GET',
      path: '/date',
    });

    expect(res1.body).not.toBe(res2.body);
  });

  test('Method PUT should not be cached when only status code is 201', async () => {
    const res1 = await app.inject({
      method: 'PUT',
      path: '/put',
      payload: {
        data: '456',
      },
    });

    const res2 = await app.inject({
      method: 'PUT',
      path: '/put',
      payload: {
        data: '123',
      },
    });

    expect(res1.body).not.toBe(res2.body);
  });
});
