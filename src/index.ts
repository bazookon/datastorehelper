export { DatastoreHelper, DatastoreInterface, InsertResult } from "./datastoreHelper";
export { DatastoreService } from './datastore.service';
export { AesEncryptDecrypt } from './aes.service';

export interface prefDatasotore {
  key: string;
  iv: string;
  projectId: string;
}
