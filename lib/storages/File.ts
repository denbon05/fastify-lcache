import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { formatToJSON, getPersistentStorageDirPath } from '../helpers';
import type {
  DataStorageType,
  IStorage, StorageSrc,
} from '../types/storage';
import MapStorage from './Map';

class FileStorage extends MapStorage implements IStorage {
  private storageDir = getPersistentStorageDirPath();

  private storageFilePath: string = join(this.storageDir, '.data.json');

  private storageMetaPath: string = join(this.storageDir, '.meta.json');

  private async createStorageSrc(src: DataStorageType): Promise<StorageSrc> {
    const jsonData = await fsPromises
      .readFile(
        (src === 'data' ? this.storageFilePath : this.storageMetaPath),
        { encoding: 'utf-8' },
      );

    return new Map(Object.entries(JSON.parse(jsonData)));
  }

  private async updatePersistenceStorage(): Promise<void> {
    const storageData = formatToJSON(super.getSrc());
    const storageMetaData = formatToJSON(super.getSrcMeta());

    await fsPromises.writeFile(this.storageFilePath, storageData, 'utf-8');
    await fsPromises.writeFile(this.storageMetaPath, storageMetaData, 'utf-8');
  }

  private async updateTmpStorage(): Promise<void> {
    const storageData = await this.createStorageSrc('data');
    const storageMeta = await this.createStorageSrc('meta');

    super.setSrc(storageData);
    super.setSrcMeta(storageMeta);
  }

  /**
   * Save data to persistence storage and
   * clear Interval which check data lifetime
   */
  public async destroy(): Promise<void> {
    await this.updatePersistenceStorage();
    await super.destroy();
  }

  /**
   * Prepare and sync storages
   */
  public async setup(): Promise<void> {
    await this.updateTmpStorage();
  }
}

export default FileStorage;
