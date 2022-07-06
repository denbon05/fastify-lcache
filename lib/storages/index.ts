import type { IStorage } from 'lib/types/storage';
import MapStorage from './Map';

export default {
  Map: MapStorage,
};

const getStorage = (storageType: string): IStorage => [MapStorage]
  .find((Storage) => Storage.name === `${storageType}Storage`);
