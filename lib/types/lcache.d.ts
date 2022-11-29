/// <reference types="node" />
import type { FastifyPluginCallback } from 'fastify';
import type { IStorageOptions } from './storage';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ICachePluginOptions extends IStorageOptions {
  methodsToCache?: Set<RequestMethod>;
  statusesToCache?: Set<number>;
  excludeRoutes?: Set<string>;
}

export interface ICacheOptions<> {
  disableCache?: boolean;
  ttlInMinutes?: number;
  methodsToCache?: RequestMethod[];
  statusesToCache?: number[];
  excludeRoutes?: string[];
}

declare const _default: FastifyPluginCallback<
ICacheOptions,
import('http').Server
>;

export default _default;
