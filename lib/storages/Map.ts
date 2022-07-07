import {
  Src,
  SrcMeta,
  IStorage,
  IStorageOptions,
} from '../types/storage';

export default class Storage implements IStorage {
  private src: Src = new Map();

  private options: IStorageOptions;

  private srcMeta: SrcMeta = new Map();

  private intervalId: ReturnType<typeof setInterval>;

  private initCacheCleaner() {
    this.intervalId = setInterval(() => {
      this.srcMeta.forEach(({ updatedAt }, key) => {
        const isTtlOutdate = Date.now() - updatedAt > this.options.ttl;
        if (isTtlOutdate) {
          this.src.delete(key);
        }
      });
    }, 15000);
  }

  /**
   * Init storage options
   */
  public constructor(options: IStorageOptions) {
    this.options = { ...this.options, ...options };
    this.initCacheCleaner();
  }

  /**
   * Get cached data
   */
  public get<T>(key: string): T {
    return this.src.get(key);
  }

  /**
   * Set data to cache
   */
  public set<T>(key: string, value: T): void {
    this.src.set(key, value);
    this.srcMeta.set(key, { updatedAt: Date.now() });
  }

  /**
   * Check if data exists in cache
   */
  public has(key: string): boolean {
    return this.src.has(key);
  }

  /**
   * Clear all data in cache if key not specified
   * @param key? string
   */
  public reset(key?: string): void {
    if (key) {
      this.src.delete(key);
      return;
    }
    this.src.clear();
  }

  /**
   * Clear Interval which check data lifetime
   */
  public destroy(): void {
    clearInterval(this.intervalId);
  }
}
