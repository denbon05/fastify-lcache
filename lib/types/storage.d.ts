/* eslint-disable no-underscore-dangle */
/// <reference types="node" />
import { FastifyPluginCallback } from 'fastify';

export interface IStorageOptions {
  ttl?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StorageMap = Map<string, any>;

export type Src = StorageMap;
export type SrcMeta = Map<
  string,
  {
    updatedAt: Date;
  }
>;

export interface IStorage {
  get<T>(key: string): T;

  set<T>(key: string, value: T): void;

  has(key: string): boolean;

  reset(key?: string): void;

  destroy(): void;
}
declare const _default: FastifyPluginCallback<IStorageOptions, import('http').Server>;
export default _default;
