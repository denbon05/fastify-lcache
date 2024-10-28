import type { FastifyReply } from 'fastify';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IStorageOptions {
  ttlInMs: number;
}

export type Src = Map<string, any>;
export type SrcMeta = Map<string, { updatedAt: number }>;

export type StoredData<T> = {
  payload: T;
  statusCode?: number;
  headers?: ReturnType<FastifyReply['getHeaders']>;
};

export interface IStorage {
  get<T>(key: string): StoredData<T>;

  set<T>(key: string, value: StoredData<T>): void;

  has(key: string): boolean;

  reset(key?: string | string[]): void;

  destroy(): void;
}
