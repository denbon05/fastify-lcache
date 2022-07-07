/// <reference types='node' />
import type { IStorageOptions } from './storage';
import { FastifyPluginCallback } from 'fastify';

export type StorageType = 'Map';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ICachePluginOptions extends IStorageOptions {
  storageType?: StorageType;
  methodsToCache?: Set<RequestMethod>;
  statusesToCache?: Set<number>;
  excludeRoutes?: Set<string>;
}

export interface ICacheOptions<> {
  disableCache?: boolean;
  ttlInMinutes?: number;
  storageType?: StorageType;
  methodsToCache?: RequestMethod[];
  statusesToCache?: number[];
  excludeRoutes?: string[];
}

declare const _default: FastifyPluginCallback<
  ICacheOptions,
  import('http').Server
>;

export default _default;
