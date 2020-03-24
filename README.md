# Datastore Helper typescript

Libreria que facilita el uso de la libreria [Google Cloud Datastore: Node.js Client](https://github.com/googleapis/nodejs-datastore) extendiendo e implementando datastorehelper y datastore service en los modelos


### Instalación 🔧

_ejecutar en la raiz del proyecto el siguiente comando_

```
npm i datastorehelper
```

_Posterior a la instalación la libreria esta lista para ser utilizada_

## Creación de un modelo habilitado para utilizar la libreria 🧠

```
import { DatastoreHelper, DatastoreInterface } from "datastorehelper";

export class Model extends DatastoreHelper implements DatastoreInterface{
      public nonIndexed:string[] = ['field1', 'field3', 'field4', 'field5'];
      public kind:string = 'Client';
      public urlsafe?:any;
      public field1?: any;
      public field2?: any;
      public field3?: any;
      public field4?: any;
      public field5?: any;
      public field6?: any;
}
```
## Ejemplo CRUD(create,read,update,delete) ⚙️

#### INSERTAR
```

let obj: Model = Object.assign(new Model(), req.body);

let modelInserted:InsertResult = await obj.insert(obj);
//modelInserted.key = key del objeto insertado
//modelInserted.entity = cuerpo del objeto insertado

res.json({
    status:200,
    model:modelInserted.entity
});
```

#### ACTUALIZAR
```
let id = req.params.id;
let obj: Model = Object.assign(new Model(), req.body);

obj.update(id, obj).then((result:any)=>{
   res.json({
       status: 200,
       model: result
   });
})

```

#### Eliminar
```
let id = req.params.id;
let instance: Model = new Model()

instance.delete(id).then(()=>{
    res.json({
            status: 200,
            message: `Eliminado Correctamente`
    });
});
```

#### Leer uno
```
import { DatastoreService, InsertResult} from 'datastorehelper';

const modelDatastore:DatastoreService = new DatastoreService();

let modelInstance: Model = new Model();
let id = req.params.id;//id es urlsafe encriptada
let instance: Model = Object.assign(new Model(), await modelInstance.read(id));
//si el modelo tiene una entity.Key se resuelve de la siguiente manera
instance.keypendiente = await modelDatastore.resolveKey(instance.keypendiente);
 res.json({
     status: 200,
     model : instance.toFirebase(instance);//toFirebase(); elimina kind,nonIndexed para no retornarlo
 });
```

#### Leer Todas las entidades de un tipo(KIND)
```
import { DatastoreService, InsertResult} from 'datastorehelper';

const modelDatastore:DatastoreService = new DatastoreService();
let modelInstance: Model = new Model();

      modelInstance.list(modelInstance.kind, 100).then((list: Model[]) => {
         //aca se resuelven las keys de la lista de Models
         let PendingPromise = list.map(async (model: Model) => {
            let urlsafe = await modelDatastore.keyToUrlSafeService(client.place);
            model.keypendiente = await modelDatastore.resolveKey(model.keypendiente);
            model.keypendiente.urlsafe = urlsafe;
            return model;
         });
         Promise.all(PendingPromise).then(results => {
            res.json({
               status: 200,
               clients: results,
               results: results.length,
            });
            return;
         });
      });
```

#### Novedades 🤘 
```
* vuelta atras, sin novedades
```

## Autores ✒️

_Mantenimiento de la libreria y creacion_

* **Osvaldo Leiva** - *Trabajo Inicial y Mantenimiento* - [Repositorio-GitHub](https://github.com/bazookon)
* **Jose Vargas** - *Trabajo Inicial y Mantenimiento* - [Repositorio-GitHub](https://github.com/JoseMarcelo-v)
