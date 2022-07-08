import type {
  IStorage, IStorageOptions, SrcMeta, StorageSrc,
} from '../types/storage';

class MapStorage implements IStorage {
  private src: StorageSrc = new Map();

  private options: IStorageOptions;

  private srcMeta: SrcMeta = new Map();

  private intervalId: ReturnType<typeof setInterval>;

  private initCacheCleaner() {
    this.intervalId = setInterval(() => {
      this.srcMeta.forEach(({ updatedAt }, key) => {
        const date = new Date();
        const isTtlOutdate = date.getTime() - updatedAt.getTime() > this.options.ttl;
        if (isTtlOutdate) {
          this.src.delete(key);
        }
      });
    }, this.options.ttl);
  }

  protected setSrc(data: StorageSrc) {
    this.src = new Map(data);
  }

  protected setSrcMeta(data: SrcMeta) {
    this.srcMeta = new Map(data);
  }

  protected getSrc(): StorageSrc {
    return this.src;
  }

  protected getSrcMeta(): SrcMeta {
    return this.srcMeta;
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
    this.srcMeta.set(key, { updatedAt: new Date() });
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
  public async destroy(): Promise<void> {
    clearInterval(this.intervalId);
  }
}

export default MapStorage;
