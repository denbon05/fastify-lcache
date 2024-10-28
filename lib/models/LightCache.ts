import type { ILightCache } from '@/types/lcache';
import type { IStorage } from '@/types/storage';

// facade for storage instance
export class LightCache implements ILightCache {
  readonly storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  get = <T>(key: string): T | undefined => {
    const { payload } = this.storage.get<T>(key);
    return payload;
  };

  set = <T>(key: string, payload: T): void => {
    // might overwrite existed value with the same key
    this.storage.set(key, { payload });
  };

  // ? what about built key on hooks
  has = (key: string): boolean => this.storage.has(key);

  reset = (key?: string | string[]): void => {
    this.storage.reset(key);
  };

  destroy = (): void => {
    this.storage.destroy();
  };
}
