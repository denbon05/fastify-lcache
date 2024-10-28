import MapStorage from '@/models/MapStorage';

describe('MapStorage', () => {
  let storage: MapStorage;

  afterEach(() => {
    storage.destroy();
  });

  test('storage should keep data for specified time', async () => {
    const ttlInMs = 4_000;
    storage = new MapStorage({ ttlInMs });
    const key = 'hi';
    const expectedValue = 'world';
    storage.set(key, { payload: expectedValue });
    // wait less than TTL
    await new Promise((resolve) => {
      setTimeout(resolve, ttlInMs / 2);
    });

    const { payload: actualValue } = storage.get<string>(key);
    expect(actualValue).toEqual(expectedValue);
  });

  test('storage should remove data after TTL', async () => {
    const ttlInMs = 2_000;
    storage = new MapStorage({ ttlInMs });
    const key = 'name';
    const expectedValue = 'roberto';
    storage.set(key, { payload: expectedValue });
    // wait more than specified TTL
    await new Promise((resolve) => {
      setTimeout(resolve, ttlInMs + ttlInMs * 0.2);
    });

    const { payload: actualValue } = storage.get<string>(key);
    expect(actualValue).toBeUndefined();
  });
});
