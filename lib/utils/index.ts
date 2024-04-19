/* eslint-disable import/prefer-default-export */
import type { FastifyRequest } from 'fastify';
import { createHash } from 'node:crypto';

const hashValue = (text: unknown): string =>
  createHash('sha256').update(JSON.stringify(text)).digest('hex');

export const buildCacheKey = (req: FastifyRequest) => {
  const { url, method, body, query } = req;

  // try to get payload in order to specify request cache key
  const payload = body || query || '';

  return `${url}-${method}-${hashValue(payload)}`;
};
