# fastify-lcache

[![Maintainability](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/maintainability)](https://codeclimate.com/github/denbon05/fastify-lcache/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/test_coverage)](https://codeclimate.com/github/denbon05/fastify-lcache/test_coverage)

<p>fastify-lcache plugin for <a href="https://www.fastify.io/" target="_blank">Fastify</a> for memorize
data on first request and use it next time until <a href="https://en.wikipedia.org/wiki/Time_to_live"  target="_blank">ttl</a> expires</p>

```bash
npm i fastify-lcache
```

<h2>Table of Contents</h2>

- [Example](#example)
- [Plugin API](#api)
  - [Options](#options-default)
  - [On fastify instance](#on-fastify-instance)
  - [Route caching](#route-caching)
- [Fastify compatibility](#fastify-version-compatibility)

## Example

```ts
// your app
import fastify from "fastify";
import lcache from "fastify-lcache";

const app = fastify();
const address = "0.0.0.0";
const port = 4000;

app.register(lcache, {
  ttlInMinutes: 10, // set cached data lifetime to 10 minutes
});

app.after(() => {
  // add your routes
  app.get("/ping", async (req, reply) => {
    reply.send("pong");
  });
});

app.listen(port, address);
```

```ts
// client wants data from your app
const url = "http://0.0.0.0:4000/ping";
// first request will return origin data from route '/ping'
// and put result to the cache
axios.get(url);
// the following requests within 10 minutes
// will return cached data on this route
axios.get(url);
```

<dl>
<dt><b>⚠️ IMPORTANT</b></dt>
<dd><i>Restarting your app resets the cache</i></dd>
</dl>

## API

### Options (default)

```ts
{
  ttlInMinutes?: 5,
  disableCache?: false,
  statusesToCache?: [200],
  methodsToCache?: ['GET'],
  excludeRoutes?: [],
  includeRoutes?: '*'
}
```

### On fastify instance

<p><b>app.lcache</b> available inside your app</p>

```ts
interface ILightCache {
  // Get cached data
  get<T>(key: string): T;

  // Set data to cache
  set<T>(key: string, value: T): void;

  // Check if data exists in cache
  has(key: string): boolean;

  // Clear all data in cache if key not specified
  reset(key?: string): void;

  // Clear Interval which check data lifetime
  destroy(): void;
}
```

### Route caching

If a route matches any pattern in `excludeRoutes`, it will **never be cached**.

**Unspecified Routes**<br />
If a route is neither in `includeRoutes` nor `excludeRoutes`:<br />
When `includeRoutes` specifies particular routes, only those specified are cached, 
while all other routes are ignored by the cache.

```js
// Scenario 1: includeRoutes: '*' with specific excludeRoutes
// Behavior: All routes are cached except '/auth/*' and '/admin/*'
{
  includeRoutes: '*',
  excludeRoutes: ['/auth*', '/admin*']
}

// Scenario 2: Specific Routes for includeRoutes and excludeRoutes
// Behavior: Only '/api/users' and '/api/orders' are cached, and the rest is ignored
{
  includeRoutes: ['/api/users', '/api/orders']
  excludeRoutes: ['/api/secret'],
}
```

### Fastify version compatibility

| Fastify | lcache |
| :-----: | :----: |
|  ^4.10  |  2.x   |
|  3-4.9  | 1-1.2  |
