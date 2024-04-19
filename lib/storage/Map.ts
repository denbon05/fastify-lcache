import { TLL_CHECK_INTERVAL_MS } from '@/constants';
import type { IStorage, IStorageOptions, Src, SrcMeta } from '../types/Storage';

export default class Storage implements IStorage {
  /** How often check the outdated cached data in ms */
  private ttlCheckIntervalMs = TLL_CHECK_INTERVAL_MS;

  private src: Src = new Map();

  private options: IStorageOptions;

  private srcMeta: SrcMeta = new Map();

  private intervalId: ReturnType<typeof setInterval>;

  private initCacheCleaner = () => {
    this.intervalId = setInterval(() => {
      this.srcMeta.forEach(({ updatedAt }, key) => {
        const isTtlOutdate = Date.now() - updatedAt > this.options.ttl;
        if (isTtlOutdate) {
          this.reset(key);
        }
      });
    }, this.ttlCheckIntervalMs);
  };

  /**
   * Init storage options
   */
  public constructor(options: IStorageOptions) {
    this.options = { ...this.options, ...options };
    this.initCacheCleaner();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get = (key: string): any => this.src.get(key);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set = (key: string, value: any): void => {
    this.src.set(key, value);
    this.srcMeta.set(key, { updatedAt: Date.now() });
  };

  public has = (key: string): boolean => this.src.has(key);

  public reset = (key?: string | string[]): void => {
    if (typeof key === 'string') {
      this.src.delete(key);
      return;
    }

    if (Array.isArray(key)) {
      key.forEach((k) => {
        this.src.delete(k);
      });
      return;
    }

    this.src.clear();
  };

  public destroy = (): void => {
    clearInterval(this.intervalId);
  };
}
