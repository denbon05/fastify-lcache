import type { ICacheOptions } from '@/types/lcache';
import type { FastifyInstance } from 'fastify';
import { getApp } from './helpers';

describe('Persistent cache', () => {
  let app: FastifyInstance;
  const defaultOpts: ICacheOptions = {
    shouldPersist: true,
  };

  beforeEach(async () => {
    app = await getApp(defaultOpts);
  });

  afterEach(async () => {
    await app.close();
  });

  test('Should be used cache after restart the app', async () => {
    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async (appInstance: FastifyInstance) =>
      appInstance.inject({
        method: 'GET',
        path: '/ping',
      });

    // put data to the cache
    await getPing(app);
    // shut down the app
    await app.close();
    // assign a new fastify instance
    app = await getApp(defaultOpts);
    await getPing(app);

    // expect the app will use cashed data
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
