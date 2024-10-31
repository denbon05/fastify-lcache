import type {
  IStorage,
  IStorageOptions,
  Src,
  SrcMeta,
  StoredData,
} from '../types/storage';

export default class Storage implements IStorage {
  private src: Src = new Map();

  private options: IStorageOptions;

  private srcMeta: SrcMeta = new Map();

  private timeoutId?: NodeJS.Timeout;

  /** Is timeout watcher enabled */
  private isWatcherEnabled = false;

  /** Watch cached data based on timeout range between cached values */
  private watchOutdated = () => {
    // initial values
    let minDiff = 0;
    // most recent outdated key
    let recentOutdatedKey: string;
    this.srcMeta.forEach(({ updatedAt }, key) => {
      const diff = Date.now() + this.options.ttlInMs - updatedAt;
      if (!minDiff || diff < minDiff) {
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
    this.options = { ...options };
  }

  public get = <T>(key: string): StoredData<T> => this.src.get(key) ?? {};

  public set = <T>(key: string, value: StoredData<T>): void => {
    this.src.set(key, value);
    this.srcMeta.set(key, { updatedAt: Date.now() });

    if (!this.isWatcherEnabled) {
      // enable watcher of outdated data
      this.watchOutdated();
    }
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
