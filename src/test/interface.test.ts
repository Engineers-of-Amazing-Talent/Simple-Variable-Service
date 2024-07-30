import { Collection } from '../interface';
import repository from '../model';

describe('Collection Interface', () => {
  test('Should be able to Write variables to the Variable Repository', () => {
    let collection = new Collection(repository); 
    expect(collection).toBeTruthy();
  });
});
