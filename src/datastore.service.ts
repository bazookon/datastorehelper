import { Datastore, Transaction } from "@google-cloud/datastore";
import { AesEncryptDecrypt } from './aes.service';
import { entity } from "@google-cloud/datastore/build/src/entity";
import fs from 'fs';
import { prefDatasotore } from ".";
export class DatastoreService {
  public ds!: Datastore;
  public aesService!: AesEncryptDecrypt

  constructor() {
    //Read Configuration
    let pref: prefDatasotore = JSON.parse(fs.readFileSync('datastore.json').toString());
    this.ds = new Datastore({ projectId: pref.projectId })
    this.aesService = new AesEncryptDecrypt(pref.key, pref.iv);
  }


  toDatastore(obj: any, nonIndexed: any) {
    nonIndexed = nonIndexed || [];
    const results: any = [];
    Object.keys(obj).forEach((value) => {

      if (obj[value] === undefined || value == 'kind' || value == 'nonIndexed' || value == 'parent' || value == 'aesService' || value == 'ds') {
        return;
      }
      results.push({
        name: value,
        value: obj[value],
        excludeFromIndexes: nonIndexed.indexOf(value) !== -1
      });

    });
    return results;
  }

  async fromDatastore(obj: any) {
    obj.urlsafe = await this.keyToUrlSafeService(obj[this.ds.KEY]);
    return obj;
  }


  async keyToUrlSafeService(key:entity.Key){
     let resolve = await this.ds.keyToLegacyUrlSafe(key);
     return this.aesService.encrypt(resolve[0]);
  }

 UrlSafeToKeyService(urlsafe:string){
    return this.ds.keyFromLegacyUrlsafe(this.aesService.decrypt(urlsafe));
 }

  //Especial Queries

  filterByField(kind: string, field: any, valuefield: any, callback: any) {
    const query = this.ds.createQuery([kind]).filter(field, '=', valuefield);
    this.ds.runQuery(query, (err: any, entity: any) => {
      if (err) {
        return callback(err);
      }
      if (entity.length != 0) {
        return callback(null, entity, entity[0][this.ds.KEY]);
      } else {
        return callback(null, entity);
      }

    });
  }

  resolveKey(key: any):Promise<any> {
    return new Promise((resolve, reject) => {
      this.ds.get(key, (err: any, data: any) => {
        if (err) return reject(err);
        resolve(data);
      })
    })
  }

  async asyncFilterByField(entity: any, field: any, valuefield: any,ancestor?:any):Promise<any> {
    let query:any;
    ancestor == undefined ? query = this.ds.createQuery([entity.kind]).filter(field, '=', valuefield) : query = this.ds.createQuery([entity.kind]).filter(field,'=',valuefield).hasAncestor(ancestor);
    // let query = this.ds.createQuery([entity.kind]).filter(field, '=', valuefield);
    return new Promise((resolve, reject) => {
      this.ds.runQuery(query, (error: any, entityResult: any) => {
        if (error) return reject(error);
        resolve(entityResult);
      })
    })
  }

  newCreate(data: any, callback: any, id?: any) {
    delete data.urlsafe;
    let key = [];


    let keyParent: entity.Key = data.parent;

    //Add prent if exists
    if (keyParent) {
      keyParent.path.forEach((keyItem: any) => {
        let keyPath: any = Number(keyItem);
        if (Number.isNaN(keyPath))
          keyPath = keyItem
        key.push(keyPath);
      })
    }

    //Add KIND
    key.push(data.kind);

    //Add id if exists
    if (id != null) {
      key.push(id);
    }
    const entity = {
      key: this.ds.key(key),
      data: this.toDatastore(data, data.nonIndexed)
    };
    this.ds.save(
      entity,
      (err) => {
        return callback(err, err ? null : data, entity.key);
      }
    );
  }

  newUpdate(id: any, data: any, callback: any) {
    delete data.urlsafe;
    const entity = {
      key: this.UrlSafeToKeyService(id),
      data: this.toDatastore(data, data.nonIndexed),
    };
    this.ds.update(
      entity,
      (err) => {
        data.key = this.ds.keyToLegacyUrlSafe(entity.key);
        return callback(err, err ? null : data);
      }
    );
  }

  newDelete(id: string, callback: any) {
    this.ds.delete(this.UrlSafeToKeyService(id), (err) => {
      return callback(err, err ? null : "Deleted")
    });
  }

  newRead(id: any, callback: any):any {
    this.ds.get(this.UrlSafeToKeyService(id), (err, entity) => {
      if (err) {
        return callback(err);
      }
      Promise.resolve(this.fromDatastore(entity)).then(results => {
        return callback(null, results);
      })
    });
  }

  newList(kind: string, limit: number,callback: any,ancestor?:entity.Key,order?:string) {
    let query;
    ancestor == undefined ? query = this.ds.createQuery([kind]).limit(limit).order(order == undefined ? 'name' : order) : 
     query = this.ds.createQuery([kind]).limit(limit).hasAncestor(ancestor);
    this.ds.runQuery(query,(err, entities: any,nextQuery:any) => {
      if (err) {
        return callback(err);
      }
      Promise.all(entities.map((entity: any) => this.fromDatastore(entity))).then(results => {
        return callback(null, results);
      })
    });
  }

  async newCreateTransaction(entities: any) {
    const transaction = this.ds.transaction();
    try {
      await transaction.run();
      transaction.save(entities);
      let result = await transaction.commit();
      return result;
    } catch (err) {
      transaction.rollback();
    }
  }

  async newDeleteTransaction(entities: any) {
    const transaction = this.ds.transaction();
    try {
      await transaction.run();
      transaction.delete(entities);
      let result = await transaction.commit();
      return result;
    } catch (err) {
      transaction.rollback();
    }
  }



}