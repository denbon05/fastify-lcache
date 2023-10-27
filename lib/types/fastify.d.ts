// eslint-disable-next-line import/no-extraneous-dependencies
import 'fastify';
import { IStorage } from './storage';

// extend fastify instance type on install package
declare module 'fastify' {
  interface FastifyInstance {
    lcache: IStorage;
  }
}
