import type { FastifyRequest } from "fastify";

export type BuildCacheKeyParam = Pick<
  FastifyRequest,
  "url" | "query" | "method" | "body"
>;
