# fastify-lcache

[![Maintainability](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/maintainability)](https://codeclimate.com/github/denbon05/fastify-lcache/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6dfec3501aa3eb441bab/test_coverage)](https://codeclimate.com/github/denbon05/fastify-lcache/test_coverage)

<p>fastify-lcache plugin for <a href="https://www.fastify.io/" target="_blank">Fastify</a> for memoize
data on first request and use next time until <a href="https://en.wikipedia.org/wiki/Time_to_live"  target="_blank">ttl</a> expires</p>

<p>Supports Fastify version ^3.0.0</p>

```sh
npm i fastify-lcache
```

## Example

```js
const address = '0.0.0.0';
const port = 4000;
```

```js
// your app
import fastify from 'fastify';
import lcache from 'fastify-lcache';

const app = fastify();
app.register(lcache, {
  ttl: 10, // set cached data lifetime to 10 minutes
});

app.after(() => {
  // add your routes
  app.get('/ping', async (req, reply) => {
    reply.send('pong');
  });
});

app.listen(port, address);
```

```js
// client wants data from your app
const url = 'http://0.0.0.0:4000/ping';
// first request will return origin data from route '/ping'
axios.get(url);
// the following requests within 10 minutes will return cached data on this route
axios.get(url);
```

<dl>
<dt><b>IMPORTANT</b></dt>
<dd><i>In case storageType <code>'tmp'</code> restarting your app resets the cache</i></dd>
</dl>

## API

### Options

```js
{
  ttl?: 5,
  storageType?: 'tmp' | 'persistence' = 'tmp',
}
```

### On fastify instance

```js
// app.lcache available inside your app
// you can specify data type: app.lcache.get<{ name: string }>('person')

interface IStorage {
  get<T>(key: string): T; // Get cached data

  set<T>(key: string, value: T): void; // Set data to cache

  has(key: string): boolean; // Check if data exists in cache

  reset(key?: string): void; // Clear all data in cache if key not specified

  destroy(): void; // Clear Interval which check data lifetime
}
```
