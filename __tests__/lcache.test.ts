import '../lib/types/fastify';
import fastify, { FastifyInstance } from 'fastify';
import lcache from '../lib/lcache';

const getSimpleApp = () => {
  const port = 3333;
  const address = '0.0.0.0';
  const app = fastify();
  const lcacheOptions = { ttl: 2 };
  app.register(lcache, lcacheOptions);

  app.after(() => {
    app.get('/ping', async (_req, reply) => {
      reply.send('pong');
    });
  });
  app.listen(port, address);

  return app;
};

describe('cache', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await getSimpleApp();
  });

  afterEach(async () => {
    await app.close();
  });

  test('plugin exists on app instance', () => {
    expect(app.hasDecorator('lcache')).toBeTruthy();
  });

  test('cache is working', async () => {
    const spy = jest.spyOn(app.lcache, 'get');
    const getPing = async () => app.inject({
      method: 'GET',
      path: '/ping',
    });

    const res1 = await getPing();
    expect(res1.body).toBe('pong');

    const res2 = await getPing();
    expect(res2.body).toBe('pong');
    expect(spy).toHaveBeenCalled();
  });
});
