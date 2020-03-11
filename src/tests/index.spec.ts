import { init, DatastoreService } from '../index';
import { expect } from 'chai';
import 'mocha';


describe('Init Library', () => {
  it('Should return true', () => {
    const result = init({ key: 'sdfdffds', iv: 'ghj56434', projectId: 'SuperProject' });
    expect(result).to.true;
  });
});


describe('Read Library',()=>{
  it('Should read jsonfile',()=>{
    const dsService:DatastoreService = new DatastoreService();
    expect(dsService).exist;
  });
});
