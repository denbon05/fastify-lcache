// eslint-disable-next-line import/no-extraneous-dependencies
import 'fastify';
import { IStorage } from './storage';

declare module 'fastify' {
  interface FastifyInstance {
    lcache: IStorage;
  }
}
