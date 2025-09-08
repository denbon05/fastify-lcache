import * as helpers from "@/utils/helpers";
import type { ICacheOptions } from "@/types/lcache";
import type { BuildCacheKeyParam } from "@/types/cached-key";

describe("helpers", () => {
  describe("wildcardToRegExp", () => {
    it("matches wildcard patterns", () => {
      const pattern = helpers.wildcardToRegExp("/api/ad*in");
      expect(pattern.test("/api/admin")).toBe(true);
      expect(pattern.test("/api/adin")).toBe(true);
      expect(pattern.test("/api/adZZin")).toBe(true);
      expect(pattern.test("/api/aDin/foo")).toBe(false);
    });
  });

  describe("formatOptions", () => {
    it("trims routes and converts collections to Sets", () => {
      const input: Required<ICacheOptions> = {
        ttlInMinutes: 1,
        disableCache: false,
        statusesToCache: [200, 201],
        methodsToCache: ["GET", "POST"],
        excludeRoutes: [" /foo ", " /bar/*  "],
        includeRoutes: [" /a ", " /b* "],
      };

      const opts = helpers.formatOptions(input);

      expect(opts.ttlInMs).toBe(60_000);
      expect(opts.methodsToCache.has("GET")).toBe(true);
      expect(opts.statusesToCache.has(201)).toBe(true);
      expect(opts.excludeRoutes).toEqual(["/foo", "/bar/*"]);
      expect(Array.isArray(opts.includeRoutes)).toBe(true);
    });

    it("preserves '*' includeRoutes as wildcard", () => {
      const input: Required<ICacheOptions> = {
        ttlInMinutes: 1,
        disableCache: false,
        statusesToCache: [200],
        methodsToCache: ["GET"],
        excludeRoutes: [],
        includeRoutes: "*",
      };

      const opts = helpers.formatOptions(input);
      expect(opts.includeRoutes).toBe("*");
    });
  });

  describe("buildCacheKey", () => {
    it("produces different keys for different bodies", () => {
      const base: Pick<BuildCacheKeyParam, "url" | "method"> = {
        url: "/path",
        method: "GET",
      };

      const key1 = helpers.buildCacheKey({ ...base, body: { a: 1 } });
      const key2 = helpers.buildCacheKey({ ...base, body: { a: 2 } });
      expect(key1).not.toEqual(key2);
    });

    it("treats equivalent body and query payloads equally", () => {
      const base: Pick<BuildCacheKeyParam, "url" | "method"> = {
        url: "/path",
        method: "GET",
      };

      const keyFromBody = helpers.buildCacheKey({ ...base, body: { a: 1 } });
      const keyFromQuery = helpers.buildCacheKey({ ...base, query: { a: 1 } });
      expect(keyFromBody).toEqual(keyFromQuery);
    });
  });
});
