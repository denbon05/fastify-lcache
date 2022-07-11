import { FastifyInstance } from 'fastify';
import '../lib/types/fastify';
import type { StorageType } from '../lib/types/storage';
import { getApp, readMemo, writeMemo } from './helpers';

describe('cache', () => {
  const storageTypes: StorageType[] = ['tmp', 'persistence'];
  let app: FastifyInstance;
  let memoData: string;
  let memoMeta: string;

  beforeAll(async () => {
    memoData = await readMemo('data');
    memoMeta = await readMemo('meta');
  });

  afterAll(async () => {
    await writeMemo('data', memoData);
    await writeMemo('meta', memoMeta);
  });

  afterEach(async () => {
    await app.close();
  });

  test.each(storageTypes)('Plugin is exist on { storageType: %p }', async (storageType) => {
    app = await getApp({ storageType });
    expect(app.hasDecorator('lcache')).toBeTruthy();
  });

  test('Temporary (default) storage working', async () => {
    app = await getApp();

    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async () => app.inject({
      method: 'GET',
      path: '/ping',
    });

    const res1 = await getPing();
    expect(res1.body).toBe('pong');
    expect(spy).not.toHaveBeenCalled();

    const res2 = await getPing();
    expect(res2.body).toBe('pong');
    expect(spy).toHaveBeenCalled();
  });

  test('Persistence storage save data after app was reloading', async () => {
    app = await getApp({ storageType: 'persistence' });
    const getPing = async () => app.inject({
      method: 'GET',
      path: '/ping',
    });

    const { body: actualBody } = await getPing();
    app.close();

    app = await getApp({ storageType: 'persistence' });
    const spy = jest.spyOn(app.lcache, 'get');

    const { body: expectedBody } = await getPing();
    expect(spy).toHaveBeenCalled();
    expect(expectedBody).toEqual(actualBody);
  });

  test('Cache should return same headers as the original request', async () => {
    app = await getApp();
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
    app = await getApp({ excludeRoutes: ['/date'], statusesToCache: [200, 201] });
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
