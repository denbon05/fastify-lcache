# fastify-lcache

[![Maintainability](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/maintainability)](https://codeclimate.com/github/denbon05/fastify-lcache/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/test_coverage)](https://codeclimate.com/github/denbon05/fastify-lcache/test_coverage)

<p>fastify-lcache plugin for <a href="https://www.fastify.io/" target="_blank">Fastify</a> for memorize
data on first request and use next time until <a href="https://en.wikipedia.org/wiki/Time_to_live"  target="_blank">ttl</a> expires</p>

<p>Supports Fastify version ^3.0.0</p>

```sh
npm i fastify-lcache
```

## Example

```ts
const address = '0.0.0.0';
const port = 4000;
```

```ts
// your app
import fastify from 'fastify';
import lcache from 'fastify-lcache';

const app = fastify();
app.register(lcache, {
  ttlInMinutes: 10, // set cached data lifetime to 10 minutes
});

app.after(() => {
  // add your routes
  app.get('/ping', async (req, reply) => {
    reply.send('pong');
  });
});

app.listen(port, address);
```

```ts
// client wants data from your app
const url = 'http://0.0.0.0:4000/ping';
// first request will return origin data from route '/ping'
// and put result to the cache
axios.get(url);
// the following requests within 10 minutes
// will return cached data on this route
axios.get(url);
```

<dl>
<dt><b>IMPORTANT</b></dt>
<dd><i>Restarting your app resets the cache</i></dd>
</dl>

## API

### Options (default)

```ts
{
  ttlInMinutes?: 5,
  disableCache?: false;
  statusesToCache?: [200],
  methodsToCache?: ['GET'],
  excludeRoutes?: [];
}
```

### On fastify instance

<p><b>app.lcache</b> available inside your app</p>

```ts
// you can specify payload data type:
// app.lcache.get<{ name: string }>('person')

interface CachedResponse<T> {
  payload: T;
  headers?: { [key: string]: string | number | string[] };
  statusCode?: number;
}

interface IStorage {
  // Get cached data
  get<T>(key: string): CachedResponse<T>;

  // Set data to cache
  set<T>(key: string, value: CachedResponse<T>): void;

  // Check if data exists in cache
  has(key: string): boolean;

  // Clear all data in cache if key not specified
  reset(key?: string): void;

  // Clear Interval which check data lifetime
  destroy(): void;
}
```
