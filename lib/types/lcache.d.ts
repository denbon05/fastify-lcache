/// <reference types="node" />
import { FastifyPluginCallback } from 'fastify';
import type { IStorageOptions } from './storage';

export type StorageType = 'Map'

export interface ICacheOptions extends IStorageOptions {
  storageType?: StorageType
}

declare const _default: FastifyPluginCallback<ICacheOptions, import('http').Server>;
export default _default;
