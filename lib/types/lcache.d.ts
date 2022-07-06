/// <reference types="node" />
import type { IStorageOptions } from './storage';
import { FastifyPluginCallback } from 'fastify';

export type StorageType = 'Map'

export interface ICacheOptions extends IStorageOptions {
  storageType?: StorageType
}

declare const _default: FastifyPluginCallback<ICacheOptions, import('http').Server>;
export default _default;
