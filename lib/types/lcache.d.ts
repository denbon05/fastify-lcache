/// <reference types="node" />
import { FastifyPluginCallback } from 'fastify';
import type { IStorageOptions, StorageType } from './storage';

export interface ICacheOptions extends IStorageOptions {
  storageType?: StorageType
}

declare const _default: FastifyPluginCallback<ICacheOptions, import('http').Server>;
export default _default;
