import { TLL_CHECK_INTERVAL_MS } from '@/constants';
import '@/types/fastify';
import type { RequestMethod } from '@/types/lcache';
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

  test('Plugin should exist on app instance', () => {
    expect(app.hasDecorator('lcache')).toBeTruthy();
  });

  test('Should be possible to put/retrieve values from app instance', async () => {
    const strKey = 'str';
    const expectedStrValue = 'data1';
    const objKey = 'obj';
    const expectedObjValue = {
      name: 'Bob',
      age: 23,
    };
    app.lcache.set(strKey, expectedStrValue);
    app.lcache.set(objKey, expectedObjValue);

    const actualStrValue = app.lcache.get(strKey);
    expect(actualStrValue).toEqual(expectedStrValue);

    const actualObjValue = app.lcache.get(objKey);
    expect(actualObjValue).toEqual(actualObjValue);
  });

  test('Should be possible to overwrite data by key', async () => {
    const key = 'str';
    const value1 = 'data1';
    const value2 = NaN;

    app.lcache.set(key, value1);
    app.lcache.set(key, value2);

    expect(app.lcache.get(key)).toStrictEqual(value2);
  });

  test('Cache should work', async () => {
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

  test('Response should be cached separately for different query', async () => {
    const spyGet = jest.spyOn(app.lcache, 'get');
    const spySet = jest.spyOn(app.lcache, 'set');
    const res1 = await app.inject({
      method: 'GET',
      path: '/date',
      query: 'asd',
    });

    const res2 = await app.inject({
      method: 'GET',
      path: '/date',
      query: 'sdf',
    });

    expect(res1.body).not.toBe(res2.body);
    expect(spyGet).not.toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledTimes(2);
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

  test('Response should be cached separately for different body', async () => {
    const spyGet = jest.spyOn(app.lcache, 'get');
    const spySet = jest.spyOn(app.lcache, 'set');
    const res1 = await app.inject({
      method: 'POST',
      path: '/post',
      body: {
        data: 'first-payload',
      },
    });

    const res2 = await app.inject({
      method: 'POST',
      path: '/post',
      body: {
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

  test('Cache reset should work', async () => {
    const spySet = jest.spyOn(app.lcache, 'set');
    const getPing = async () =>
      app.inject({
        method: 'GET',
        path: '/ping',
      });

    const postPing = async () =>
      app.inject({
        method: 'POST',
        path: '/ping',
      });

    const dataKey1 = 'someKey1';
    const dataValue1 = 'someValue1';
    const dataKey2 = 'someKey2';
    const dataValue2 = [1, 2, 3, 4];
    const dataKey3 = 'someKey3';
    const dataValue3 = 'someValue3';

    // add data to the cache via request
    await getPing();
    await postPing();
    // manually set some values
    app.lcache.set(dataKey1, dataValue1);
    app.lcache.set(dataKey2, dataValue2);
    app.lcache.set(dataKey3, dataValue3);

    expect(spySet).toBeCalledTimes(5); // 1 post + 1 get requests + 3 manual set
    // remove specific key
    app.lcache.reset(dataKey1);
    app.lcache.reset([dataKey3]); // also check array

    expect(app.lcache.get(dataKey1)).toBeFalsy();
    expect(app.lcache.get(dataKey1)).toBeUndefined();
    expect(app.lcache.get(dataKey3)).toBeUndefined();
    // expect not specified data is still in the cache
    expect(app.lcache.get(dataKey2)).toStrictEqual(dataValue2);

    // prune all cached data
    app.lcache.reset();
    expect(app.lcache.has(dataKey2)).toBeFalsy();
    expect(app.lcache.get(dataKey2)).toBeUndefined();

    // check cached data via request
    const spyGet = jest.spyOn(app.lcache, 'get');
    await getPing();
    await postPing();
    // lcache should place data again to the cache and not try to get it
    expect(spyGet).not.toHaveBeenCalled();
  });
});

describe('Disabled lcache plugin', () => {
  let app: FastifyInstance;
  const methodsToCache: RequestMethod[] = ['GET', 'POST', 'DELETE'];

  beforeEach(async () => {
    app = await getApp({
      excludeRoutes: [],
      statusesToCache: [200, 201],
      methodsToCache,
      disableCache: true,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  test.each(methodsToCache)(
    "Shouldn't cache %s method regardless plugin config",
    async (httpMethod) => {
      const spySet = jest.spyOn(app.lcache, 'set');

      await app.inject({
        method: httpMethod,
        path: '/ping',
        payload: {
          data: '456',
        },
      });

      expect(spySet).not.toHaveBeenCalled();
    }
  );
});

describe('Interval cleanup', () => {
  // convert to minutes for lcache usage
  const ttlInMinutes = TLL_CHECK_INTERVAL_MS / 60000;
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await getApp({
      ttlInMinutes,
    });
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllTimers();
  });

  test('Cached data should be removed after ttl', async () => {
    const key = 'someKey';
    const value = 'someValue';

    app.lcache.set(key, value);
    // wait doubled ttl time
    await new Promise((resolve) => {
      setTimeout(resolve, TLL_CHECK_INTERVAL_MS * 2);
    });

    expect(app.lcache.get(key)).toBeUndefined();
    expect(app.lcache.has(key)).toBeFalsy();
  });
});
