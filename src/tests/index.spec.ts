import { DatastoreService } from '../index';
import { expect } from 'chai';
import 'mocha';





describe('Read Library',()=>{
  it('Should read jsonfile',()=>{
    const dsService:DatastoreService = new DatastoreService();
    expect(dsService).exist;
  });
});
