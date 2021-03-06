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

export interface ListResult {
  entities: any;
  loadMore: any;
}

export class DatastoreHelper extends DatastoreService {


  public toFirebase(entity: any) {
    let firebaseEntity = Object.assign({},entity);
    delete firebaseEntity.ds;
    delete firebaseEntity.namespace;
    delete firebaseEntity.aesService;
    delete firebaseEntity.parent;
    delete firebaseEntity.nonIndexed;
    delete firebaseEntity.kind;
    return firebaseEntity;
  }



  public key(obj:any):entity.Key{
    return obj[this.ds.KEY];
  }

  
  public insert(entity: any, id?: string):Promise<InsertResult> {
    return new Promise<InsertResult>((resolve, reject) => {
      this.newCreate(entity, (err: any, entityResult: any, key: entity.Key) => {
        if (err) return reject(err);
        let result: InsertResult = { entity: entityResult, key: key };
        resolve(result);
      }, id != undefined || null ? id : null);
    });
  }

  public update(id: string, entity: any):Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.newUpdate(id, entity, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public delete(id: string):Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.newDelete(id, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public read(id: string):Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.newRead(id, (err: any, entityResult: any) => {
        if (err) return reject(err);
        resolve(entityResult);
      })
    });
  }

  public list(kind: string, limit: number,ancestor?:entity.Key,order?:string):Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.newList(kind, limit,(err: any, entities: any) => {
        if (err) return reject(err);
        resolve(entities);
      },ancestor,order)
    });
  }

}