/* eslint-disable import/prefer-default-export */
import fastify from 'fastify';
import lcache from '../../lib';
import type { ICacheOptions } from '../../lib/types/lcache';

export const getApp = (options: ICacheOptions = {}) => {
  const app = fastify();
  app.register(lcache, options);

  app.after(() => {
    app.get('/ping', async (_req, reply) => {
      reply.send('pong');
    });

    app.get('/json', async (_req, reply) => {
      reply.send({ hello: 'world' });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.post('/post', async (req: any, reply) => {
      reply.status(201);
      reply.send(req.body.data);
    });

    app.get('/date', async (_req, reply) => {
      await new Promise((resolve) => {
        setTimeout(() => resolve(reply.send(Date.now())), Math.random() * 100);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.put('/put', async (req: any, reply) => {
      reply.status(201).send(req.body.data);
    });
  });

  return app;
};
