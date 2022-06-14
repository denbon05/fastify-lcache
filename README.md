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
import fastify from 'fastify';
import lcache from 'fastify-lcache';

const app = fastify();
app.register(lcache, { ttl: 10 }); // default 5 minutes

app.after(() => {
  // add your routes
  app.get('/ping', async (req, reply) => {
    reply.send('pong');
  });
});

app.listen(port, address);
```

## API

### Options

```js
{
  ttl?: 5, // default cache time is 5 minutes
}
```
