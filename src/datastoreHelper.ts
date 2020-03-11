import { DatastoreService } from './datastore.service';
import { entity } from '@google-cloud/datastore/build/src/entity';

export interface DatastoreInterface {
  nonIndexed: string[];
  kind: string;
  parent?: entity.Key;
}
export interface InsertResult {
  entity: any;
  key: entity.Key;
}

export class DatastoreHelper extends DatastoreService {


  public toFirebase(entity: any) {
    delete entity.ds;
    delete entity.aesService;
    delete entity.parent;
    delete entity.nonIndexed;
    delete entity.kind;
    return entity;
  }

  public async keyToUrlSafe(key:entity.Key){
    let urlSafe = await this.ds.keyToLegacyUrlSafe(key);
    return this.aesService.encrypt(urlSafe);
  }


  public insert(entity: any, id?: string) {
    return new Promise<InsertResult>((resolve, reject) => {
      this.newCreate(entity, (err: any, entityResult: any, key: entity.Key) => {
        if (err) return reject(err);
        let result: InsertResult = { entity: entityResult, key: key };
        resolve(result);
      }, id != undefined || null ? id : null);
    });
  }

  public update(id: string, entity: any) {
    return new Promise<any>((resolve, reject) => {
      this.newUpdate(id, entity, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public delete(id: string) {
    return new Promise<any>((resolve, reject) => {
      this.newDelete(id, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public read(id: string) {
    return new Promise<any>((resolve, reject) => {
      this.newRead(id, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public list(kind: string, limit: number) {
    return new Promise<any>((resolve, reject) => {
      this.newList(kind, limit, (err: any, entities: any) => {
        if (err) return reject(err);
        resolve(entities);
      })
    });
  }

}