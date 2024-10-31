import type {
  IStorage,
  IStorageOptions,
  Src,
  SrcMeta,
  StorageWatcherMethod,
} from '../types/Storage';

export default class Storage implements IStorage {
  private src: Src = new Map();

  private options: IStorageOptions;

  private srcMeta: SrcMeta = new Map();

  private timeoutId: NodeJS.Timeout;

  private watcherMethod: StorageWatcherMethod = 'timeout';

  /** Is timeout watcher enabled */
  private isWatcherEnabled = false;

  /** @experimental Could be deprecated in the future releases */
  private initCacheCleaner = () => {
    this.timeoutId = setInterval(() => {
      this.srcMeta.forEach(({ updatedAt }, key) => {
        const isTTLOutdated = Date.now() - updatedAt > this.options.ttl;
        if (isTTLOutdated) {
          this.reset(key);
        }
      });
    }, this.options.ttlCheckIntervalMs);
  };

  /** Watch cached data based on timeout range between cached values */
  private watchOutdated = () => {
    // initial values
    let minDiff = Infinity;
    // most recent outdated key
    let recentOutdatedKey: string;
    this.srcMeta.forEach(({ updatedAt }, key) => {
      const diff = this.options.ttl - updatedAt;
      if (diff < minDiff) {
        minDiff = diff;
        recentOutdatedKey = key;
      }
    });
    this.timeoutId = setTimeout(
      () => {
        this.reset(recentOutdatedKey);

        if (this.isWatcherEnabled) {
          this.watchOutdated();
        }
      },
      minDiff > 0 ? minDiff : 0
    );
  };

  /**
   * @param {IStorageOptions} options Init storage options
   */
  public constructor(options: IStorageOptions) {
    this.options = { ...this.options, ...options };

    if (typeof this.options.ttlCheckIntervalMs !== 'undefined') {
      this.watcherMethod = 'interval';
      // watch cached value by interval value provided by client
      this.initCacheCleaner();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get = (key: string): any => this.src.get(key);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set = (key: string, value: any): void => {
    if (this.watcherMethod === 'timeout' && !this.isWatcherEnabled) {
      // enable watcher of outdated data
      this.watchOutdated();
    }

    this.src.set(key, value);
    this.srcMeta.set(key, { updatedAt: Date.now() });
  };

  public has = (key: string): boolean => this.src.has(key);

  /** Remove value by specified key or keys.
   * @note Remove all cached values if argument not specified. */
  public reset = (key?: string | string[]): void => {
    if (typeof key === 'string') {
      this.src.delete(key);
      this.srcMeta.delete(key);
    } else if (Array.isArray(key)) {
      key.forEach((k) => {
        this.src.delete(k);
        this.srcMeta.delete(k);
      });
    } else {
      // reset all cached data
      this.src.clear();
      this.srcMeta.clear();
    }

    if (this.srcMeta.size === 0) {
      // there is not data to watch - mark watcher as disabled
      this.isWatcherEnabled = false;
    }
  };

  public destroy = (): void => {
    this.reset(); // prune all data
    clearTimeout(this.timeoutId);
  };
}
