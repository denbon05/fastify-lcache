import 'fastify';
import { IStorage } from './storage';

declare module 'fastify' {
  interface FastifyInstance {
    lcache: IStorage
  }
}
