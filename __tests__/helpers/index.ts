/* eslint-disable no-return-await */
import fastify from 'fastify';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import lcache from '../../lib/lcache';
import { ICacheOptions } from '../../lib/types/lcache';
import type { DataStorageType } from '../../lib/types/storage';

const defaultOptions: ICacheOptions = {
  ttlInMinutes: 2,
  excludeRoutes: [],
  statusesToCache: [200],
};

export const getApp = (options: ICacheOptions = {}) => {
  const app = fastify();
  app.register(lcache, { ...defaultOptions, ...options });

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
      setTimeout(() => reply.send(Date.now()), Math.random() * 100);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.put('/put', async (req: any, reply) => {
      reply.status(201).send(req.body.data);
    });
  });

  return app;
};

const getMemoPath = (memoType: DataStorageType) => (
  resolve(process.cwd(), 'lib/storages/memo', (memoType === 'data' ? '.data.json' : '.meta.json'))
);

export const readMemo = async (memoType: DataStorageType) => (
  await readFile(getMemoPath(memoType), 'utf-8')
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeMemo = async (memoType: DataStorageType, data: any) => {
  await writeFile(getMemoPath(memoType), data, 'utf-8');
};
