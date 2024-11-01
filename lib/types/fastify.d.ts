import "fastify";
import type { ILightCache } from "./lcache";

// extend fastify instance type on install package
declare module "fastify" {
  interface FastifyInstance {
    lcache: ILightCache;
  }
}
