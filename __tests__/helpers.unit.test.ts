import * as helpers from "@/utils/helpers";

describe("helpers", () => {
  describe("wildcardToRegExp", () => {
    it("should match wildcard patterns", () => {
      const pattern = helpers.wildcardToRegExp("/api/ad*in");
      expect(pattern.test("/api/admin")).toBe(true);
      expect(pattern.test("/api/adin")).toBe(true);
      expect(pattern.test("/api/adZZin")).toBe(true);
      expect(pattern.test("/api/aDin/foo")).toBe(false);
    });
  });

  describe("formatOptions and buildCacheKey", () => {
    it("should trim routes and convert collections to Sets, and hash payload into key", () => {
      const opts = helpers.formatOptions({
        ttlInMinutes: 1,
        disableCache: false,
        statusesToCache: [200, 201],
        methodsToCache: ["GET", "POST"],
        excludeRoutes: [" /foo ", " /bar/*  "],
        includeRoutes: [" /a ", " /b* "],
      } as any);

      expect(opts.ttlInMs).toBe(60_000);
      expect(opts.methodsToCache.has("GET")).toBe(true);
      expect(opts.statusesToCache.has(201)).toBe(true);
      expect(opts.excludeRoutes).toEqual(["/foo", "/bar/*"]);
      expect(Array.isArray(opts.includeRoutes)).toBe(true);

      const key1 = helpers.buildCacheKey({
        url: "/path",
        method: "GET",
        body: { a: 1 },
        query: undefined,
      } as any);
      const key2 = helpers.buildCacheKey({
        url: "/path",
        method: "GET",
        body: { a: 2 },
        query: undefined,
      } as any);
      const key3 = helpers.buildCacheKey({
        url: "/path",
        method: "GET",
        body: undefined,
        query: { a: 1 },
      } as any);

      // same payload (although body vs query) produces same cache key
      expect(key1).not.toEqual(key2);
      expect(key1).toEqual(key3);
      expect(key2).not.toEqual(key3);
    });

    it("should preserve '*' includeRoutes as wildcard", () => {
      const opts = helpers.formatOptions({
        ttlInMinutes: 1,
        disableCache: false,
        statusesToCache: [200],
        methodsToCache: ["GET"],
        excludeRoutes: [],
        includeRoutes: "*",
      } as any);

      expect(opts.includeRoutes).toBe("*");
    });
  });
});

