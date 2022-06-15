import type { IStorageOptions } from './storage';

export type StorageType = 'Map'

export interface ICacheOptions extends IStorageOptions {
  storageType?: StorageType
}
