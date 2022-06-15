/// <reference types="node" />
import { FastifyPluginCallback } from 'fastify';
import type { IStorageOptions } from './types/storage';

export declare class Storage {
  private src;

  private options;

  private srcMeta;

  private intervalId;

  private initCacheCleaner;

  constructor(options?: IStorageOptions);

  get(key: string): unknown;

  set(key: string, value: unknown): void;

  has(key: string): boolean;

  destroy(): void;
}
declare const _default: FastifyPluginCallback<IStorageOptions, import('http').Server>;
export default _default;
