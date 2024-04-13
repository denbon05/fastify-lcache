import '@/types/fastify';
import type { FastifyInstance } from 'fastify';
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
    const spyGet = jest.spyOn(app.lcache, 'get');
    const spySet = jest.spyOn(app.lcache, 'set');
    const getPing = async () =>
      app.inject({
        method: 'GET',
        path: '/ping',
      });

    const res1 = await getPing();
    expect(res1.body).toBe('pong');
    expect(spySet).toHaveBeenCalledTimes(1);

    const res2 = await getPing();
    // `set` shouldn't be called again
    expect(spySet).toHaveBeenCalledTimes(1);
    expect(res2.body).toBe('pong');
    expect(spyGet).toHaveBeenCalledTimes(1);
  });

  test('Cache should return same headers as the original request', async () => {
    const spyGet = jest.spyOn(app.lcache, 'get');
    const getJson = async () =>
      app.inject({
        method: 'GET',
        path: '/json',
      });

    const res1 = await getJson();
    const res2 = await getJson();

    expect(res2.headers['content-type']).toBe(res1.headers['content-type']);
    expect(spyGet).toHaveBeenCalledTimes(1);
  });
});

describe('Caching with custom options', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await getApp({
      excludeRoutes: ['/date'],
      statusesToCache: [200, 201],
      methodsToCache: ['GET', 'POST'],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  test('Response should be cached separately for different payload', async () => {
    const spyGet = jest.spyOn(app.lcache, 'get');
    const spySet = jest.spyOn(app.lcache, 'set');
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
    expect(spyGet).not.toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledTimes(2);
  });

  test('Excluded routes should not be cached', async () => {
    const spySet = jest.spyOn(app.lcache, 'set');
    const res1 = await app.inject({
      method: 'GET',
      path: '/date',
    });

    const res2 = await app.inject({
      method: 'GET',
      path: '/date',
    });

    expect(res1.body).not.toBe(res2.body);
    expect(spySet).not.toHaveBeenCalled();
  });

  test('PUT method should not be cached when only status code is 201', async () => {
    const spySet = jest.spyOn(app.lcache, 'set');
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
    expect(spySet).not.toHaveBeenCalled();
  });
});
