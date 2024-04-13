/* eslint-disable import/prefer-default-export */
import type { FastifyRequest } from 'fastify';
import { createHash } from 'node:crypto';

const hashValue = (text: unknown): string =>
  createHash('sha256').update(JSON.stringify(text)).digest('hex');

export const buildCacheKey = (req: FastifyRequest) => {
  const { url, method, body } = req;

  // if there is a body - add it to the cache key
  return body ? `${url}-${method}-${hashValue(body)}` : `${url}-${method}`;
};
