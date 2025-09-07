import { LightCache } from "@/models/LightCache";
import MapStorage from "@/models/MapStorage";

describe("LightCache facade", () => {
  it("destroy should prune all data immediately", () => {
    const storage = new MapStorage({ ttlInMs: 60_000 });
    const cache = new LightCache(storage);

    const key = "key-to-destroy";
    const value = { foo: "bar" };

    cache.set(key, value);
    expect(cache.has(key)).toBeTruthy();
    expect(cache.get<typeof value>(key)).toEqual(value);

    // destroy underlying storage via facade
    cache.destroy();

    expect(cache.has(key)).toBeFalsy();
    expect(cache.get<typeof value>(key)).toBeUndefined();
  });

  it("get should return undefined for missing keys", () => {
    const storage = new MapStorage({ ttlInMs: 60_000 });
    const cache = new LightCache(storage);

    expect(cache.get("missing-key")).toBeUndefined();

    cache.destroy();
  });
});

