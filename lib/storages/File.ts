import { promises as fsPromises } from 'fs';
import { join } from 'path';
import type {
  IStorage, IStorageOptions,
} from '../types/storage';
import { formatToJSON } from '../helpers';
import MapStorage from './Map';

class FileStorage extends MapStorage implements IStorage {
  private storageFilePath: string = join('memo', '.data.json');

  private storageMetaPath: string = join('memo', '.meta.json');

  private async read(src: 'data' | 'meta') {
    const jsonData = await fsPromises
      .readFile((src === 'data' ? this.storageFilePath : this.storageMetaPath), { encoding: 'utf-8' });

    return JSON.parse(jsonData);
  }

  private async updatePersistenceStorage(): Promise<void> {
    const storageData = formatToJSON(super.getSrc());
    const storageMetaData = formatToJSON(super.getSrcMeta());

    await fsPromises.writeFile(this.storageFilePath, storageData, 'utf-8');
    await fsPromises.writeFile(this.storageMetaPath, storageMetaData, 'utf-8');
  }

  private async updateTmpStorage(): Promise<void> {
    const storageData = await this.read('data');
    const storageMeta = await this.read('meta');

    super.setSrc(storageData);
    super.setSrcMeta(storageMeta);
  }

  public constructor(options: IStorageOptions) {
    super(options);
    this.updateTmpStorage();
  }

  /**
   * Save data to persistence storage and
   * clear Interval which check data lifetime
   */
  public async destroy(): Promise<void> {
    await this.updatePersistenceStorage();
    await super.destroy();
  }
}

export default FileStorage;
