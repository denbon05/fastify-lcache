import type { FastifyRequest } from "fastify";

// Allow omitting body/query in tests and callers where one of them is unused
export type BuildCacheKeyParam = Pick<FastifyRequest, "url" | "method"> &
  Partial<Pick<FastifyRequest, "query" | "body">>;
