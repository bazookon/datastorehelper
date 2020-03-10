import { Datastore, Transaction } from "@google-cloud/datastore";
import { AesEncryptDecrypt } from './aes.service';
import { entity } from "@google-cloud/datastore/build/src/entity";
export const ds: Datastore = new Datastore({ projectId: 'vendeme' });
export class DatastoreService {

  constructor(
    public aesService: AesEncryptDecrypt
  ) { }

  toDatastore(obj: any, nonIndexed: any) {
    nonIndexed = nonIndexed || [];
    const results: any = [];
    Object.keys(obj).forEach((value) => {

      if (obj[value] === undefined || value == 'kind' || value == 'nonIndexed' || value == 'parent') {
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
    obj.urlsafe = await ds.keyToLegacyUrlSafe(obj[ds.KEY]);
    obj.urlsafe = this.aesService.encrypt(obj.urlsafe[0]);
    return obj;
  }


  //Especial Queries

  filterByField(kind: string, field: any, valuefield: any, callback: any) {
    const query = ds.createQuery([kind]).filter(field, '=', valuefield);
    ds.runQuery(query, (err: any, entity: any) => {
      if (err) {
        return callback(err);
      }
      if (entity.length != 0) {
        return callback(null, entity, entity[0][ds.KEY]);
      } else {
        return callback(null, entity);
      }

    });
  }

  resolveKey(key: any) {
    return new Promise((resolve, reject) => {
      ds.get(key, (err: any, data: any) => {
        if (err) return reject(err);
        resolve(data);
      })
    })
  }

  async asyncFilterByField(entity: any, field: any, valuefield: any) {
    const query = ds.createQuery([entity.kind]).filter(field, '=', valuefield);
    return new Promise((resolve, reject) => {
      ds.runQuery(query, (error: any, entityResult: any) => {
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
      key: ds.key(key),
      data: this.toDatastore(data, data.nonIndexed)
    };
    ds.save(
      entity,
      (err) => {
        return callback(err, err ? null : data, entity?.key);
      }
    );
  }

  newUpdate(id: any, data: any, callback: any) {
    delete data.urlsafe;
    let decrypt = this.aesService.decrypt(id)
    const key = ds.keyFromLegacyUrlsafe(decrypt);
    const entity = {
      key: key,
      data: this.toDatastore(data, data.nonIndexed),
    };
    ds.update(
      entity,
      (err) => {
        data.key = ds.keyToLegacyUrlSafe(entity.key);
        return callback(err, err ? null : data);
      }
    );
  }

  newDelete(id: string, callback: any) {
    let decrypt = this.aesService.decrypt(id);
    const key = ds.keyFromLegacyUrlsafe(decrypt);
    ds.delete(key, (err) => {
      return callback(err, err ? null : "Deleted")
    });
  }

  newRead(id: any, callback: any) {
    let decrypt = this.aesService.decrypt(id);
    const key = ds.keyFromLegacyUrlsafe(decrypt);
    ds.get(key, (err, entity) => {
      if (err) {
        return callback(err);
      }
      Promise.resolve(this.fromDatastore(entity)).then(results => {
        return callback(null, results);
      })
    });
  }

  newList(kind: string, limit: number, callback: any) {
    const query = ds.createQuery([kind]).limit(limit).order('name');
    ds.runQuery(query, (err, entities: any) => {
      if (err) {
        return callback(err);
      }
      Promise.all(entities.map((entity: any) => this.fromDatastore(entity))).then(results => {
        return callback(null, results);
      })
    });
  }

  async newCreateTransaction(entities: any) {
    const transaction = ds.transaction();
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
    const transaction = ds.transaction();
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