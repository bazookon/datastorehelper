import fs from 'fs';

export { DatastoreHelper, DatastoreInterface, InsertResult } from "./datastoreHelper";
export { DatastoreService } from './datastore.service';
export { AesEncryptDecrypt } from './aes.service';

export interface prefDatasotore {
  key: string;
  iv: string;
  projectId: string;
}
export function init({ key, iv, projectId }: { key: string, iv: string, projectId: string }) {
  let pref: any = {
    key: key,
    iv: iv,
    projectId: projectId
  };

  let result: boolean = !Object.keys(pref).some((key) => {
    return !pref[key];
  });

  if (result)
    fs.writeFile('datastore.json', JSON.stringify(pref), (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });

  return result;
}