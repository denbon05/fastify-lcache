import 'fastify';
import { Storage } from '../lcache';

declare module 'fastify' {
  interface FastifyInstance {
    lcache: Storage
  }
}
