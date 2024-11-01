import "@/types/fastify";
import type { RequestMethod } from "@/types/lcache";
import type { FastifyInstance } from "fastify";
import { getApp, spies } from "./helpers/lcache";

describe("Light Cache Fastify plugin", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe("Caching with default options", () => {
    beforeEach(async () => {
      app = await getApp();
    });

    it("Plugin should exist on app instance", () => {
      expect(app.hasDecorator("lcache")).toBeTruthy();
    });

    it("should be possible to put/retrieve values from app instance", () => {
      const strKey = "str";
      const expectedStrValue = "data1";
      const objKey = "obj";
      const expectedObjValue = {
        name: "Bob",
        age: 23,
      };
      app.lcache.set(strKey, expectedStrValue);
      app.lcache.set(objKey, expectedObjValue);

      const actualStrValue = app.lcache.get(strKey);
      expect(actualStrValue).toEqual(expectedStrValue);

      const actualObjValue = app.lcache.get(objKey);
      expect(actualObjValue).toEqual(actualObjValue);
    });

    it("should be possible to overwrite data by key", () => {
      const key = "str";
      const value1 = "data1";
      const value2 = NaN;

      app.lcache.set(key, value1);
      app.lcache.set(key, value2);

      expect(app.lcache.get(key)).toStrictEqual(value2);
    });

    it("cache should work", async () => {
      const expectedValue = "pong";
      const getPing = async () =>
        app.inject({
          method: "GET",
          path: "/ping",
        });

      const res1 = await getPing();
      expect(res1.body).toBe(expectedValue);
      // reaches actual endpoint
      expect(spies.getPing).toHaveBeenCalledTimes(1);

      // cached data
      const res2 = await getPing();
      // expect endpoint no longer reachable, data coming from cache
      expect(spies.getPing).toHaveBeenCalledTimes(1);
      expect(res2.body).toBe(expectedValue);
    });

    it("cache should return same headers as the original request", async () => {
      const getJson = async () =>
        app.inject({
          method: "GET",
          path: "/json",
        });

      const res1 = await getJson();
      const res2 = await getJson();

      expect(res2.headers["content-type"]).toBe(res1.headers["content-type"]);
      // endpoint reached only once
      expect(spies.getJSON).toHaveBeenCalledTimes(1);
    });

    it("response should be cached separately for different query", async () => {
      const res1 = await app.inject({
        method: "GET",
        path: "/date",
        query: "asd",
      });

      const res2 = await app.inject({
        method: "GET",
        path: "/date",
        query: "sdf",
      });

      expect(res1.body).not.toBe(res2.body);
      // cache is not expected to be used
      expect(spies.getDate).toHaveBeenCalledTimes(2);
    });
  });

  describe("caching with custom options", () => {
    beforeEach(async () => {
      app = await getApp({
        excludeRoutes: ["/date"],
        statusesToCache: [200, 201],
        methodsToCache: ["GET", "POST"],
      });
    });

    it("response should be cached separately for different body", async () => {
      const res1 = await app.inject({
        method: "POST",
        path: "/post",
        body: {
          data: "first-payload",
        },
      });

      const res2 = await app.inject({
        method: "POST",
        path: "/post",
        body: {
          data: "second-payload",
        },
      });

      expect(res1.body).not.toBe(res2.body);
      // endpoint should be reached each time
      expect(spies.postPost).toHaveBeenCalledTimes(2);
    });

    it("excluded routes should not be cached", async () => {
      const res1 = await app.inject({
        method: "GET",
        path: "/date",
      });

      const res2 = await app.inject({
        method: "GET",
        path: "/date",
      });

      expect(res1.body).not.toBe(res2.body);
      expect(spies.getDate).toHaveBeenCalledTimes(2);
    });

    it("PUT method should not be cached when only status code is 201", async () => {
      const res1 = await app.inject({
        method: "PUT",
        path: "/put",
        payload: {
          data: "456",
        },
      });

      const res2 = await app.inject({
        method: "PUT",
        path: "/put",
        payload: {
          data: "123",
        },
      });

      expect(res1.body).not.toBe(res2.body);
      expect(spies.putPut).toHaveBeenCalledTimes(2);
    });

    it("cache reset should work", async () => {
      const getPing = async () =>
        app.inject({
          method: "GET",
          path: "/ping",
        });

      const postPing = async () =>
        app.inject({
          method: "POST",
          path: "/ping",
        });

      const dataKey1 = "someKey1";
      const dataValue1 = "someValue1";
      const dataKey2 = "someKey2";
      const dataValue2 = [1, 2, 3, 4];
      const dataKey3 = "someKey3";
      const dataValue3 = "someValue3";

      // add data to the cache via request
      await postPing();
      await getPing();
      // manually set some values
      app.lcache.set(dataKey1, dataValue1);
      app.lcache.set(dataKey2, dataValue2);
      app.lcache.set(dataKey3, dataValue3);

      // 1 post + 1 get + 3 manual set
      // remove specific key
      app.lcache.reset(dataKey1);
      app.lcache.reset([dataKey3]); // also test array

      expect(app.lcache.has(dataKey1)).toBeFalsy();
      expect(app.lcache.get(dataKey1)).toBeUndefined();
      expect(app.lcache.get(dataKey3)).toBeUndefined();
      // expect not removed data is still in the cache
      expect(app.lcache.get(dataKey2)).toStrictEqual(dataValue2);

      // prune all cached data
      app.lcache.reset();
      expect(app.lcache.has(dataKey2)).toBeFalsy();
      expect(app.lcache.get(dataKey2)).toBeUndefined();

      // check cached data via request
      await getPing();
      await postPing();
      // the endpoints should be reached again
      expect(spies.getPing).toHaveBeenCalledTimes(2);
      expect(spies.postPing).toHaveBeenCalledTimes(2);
    });
  });

  describe("Route caching", () => {
    beforeEach(async () => {
      app = await getApp({
        excludeRoutes: ["/ping", "/api/adm*"],
        includeRoutes: ["/ping", "/js*n", "/api/admin*", "/date/*"],
        statusesToCache: [200, 201],
        methodsToCache: ["GET", "POST", "PUT"],
      });
    });

    it("should cache included route pattern", async () => {
      await app.inject({
        path: "/json",
      });
      await app.inject({
        path: "/json",
      });

      expect(spies.getJSON).toHaveBeenCalledTimes(1);
    });

    it("shouldn't cache unspecified route in 'includeRoutes'", async () => {
      await app.inject({
        method: "put",
        path: "/put",
      });
      await app.inject({
        method: "put",
        path: "/put",
      });

      expect(spies.putPut).toHaveBeenCalledTimes(2);
    });

    it("shouldn't cache included routes if excluded routes match", async () => {
      await app.inject({
        method: "POST",
        path: "/ping",
      });
      await app.inject({
        method: "POST",
        path: "/ping",
      });

      expect(spies.postPing).toHaveBeenCalledTimes(2);
    });

    it("shouldn't cache excluded pattern", async () => {
      await app.inject({
        method: "POST",
        path: "/api/admin",
      });
      await app.inject({
        method: "POST",
        path: "/api/admin",
      });

      expect(spies.postApiAdmin).toHaveBeenCalledTimes(2);
    });

    it("shouldn't cache route pattern with trailing slash", async () => {
      await app.inject({
        path: "/date",
      });
      await app.inject({
        path: "/date",
      });

      expect(spies.getDate).toHaveBeenCalledTimes(2);
    });
  });

  describe("Disabled lcache plugin", () => {
    const methodsToCache: RequestMethod[] = ["get", "post", "delete"];

    beforeEach(async () => {
      app = await getApp({
        excludeRoutes: [],
        statusesToCache: [200, 201],
        methodsToCache,
        // disable cache programmatically
        disableCache: true,
      });
    });

    it.each(methodsToCache)(
      "shouldn't reach %s /ping avoiding cache",
      async (httpMethod) => {
        await app.inject({
          method: httpMethod,
          path: "/ping",
          payload: {
            data: "456",
          },
        });

        await app.inject({
          method: httpMethod,
          path: "/ping",
          payload: {
            data: "456",
          },
        });

        const method = `${httpMethod}Ping` as keyof typeof spies;
        // each time reach endpoint
        expect(spies[method]).toHaveBeenCalledTimes(2);
      }
    );
  });

  describe("TTL", () => {
    const msToWait = 3_000;
    // convert to minutes for lcache usage
    const ttlInMinutes = msToWait / 60_000;

    beforeEach(() => {
      // increase timeout of the tests
      jest.setTimeout(msToWait * 3);
    });

    it("cached data should be removed after ttl - timeout", async () => {
      app = await getApp({
        ttlInMinutes,
      });

      const key = "someKey";
      const value = "someValue";

      app.lcache.set(key, value);
      // wait increased ttl time
      await new Promise((resolve) => {
        setTimeout(resolve, msToWait);
      });

      expect(app.lcache.has(key)).toBeFalsy();
      expect(app.lcache.get(key)).toBeUndefined();
    });
  });
});
