import '../lib/types/fastify';
import { FastifyInstance } from 'fastify';
import { getApp } from './helpers';

describe('Caching with default options', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await getApp();
  });

  afterEach(async () => {
    await app.close();
  });

  test('Plugin exists on app instance', () => {
    expect(app.hasDecorator('lcache')).toBeTruthy();
  });

  test('Cache is working', async () => {
    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async () =>
      app.inject({
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
    const getJson = async () =>
      app.inject({
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
    app = await getApp({
      excludeRoutes: ['/date'],
      statusesToCache: [200, 201],
    });
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
