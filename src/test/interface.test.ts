import { Collection } from '../interface';

describe('Collection Interface', () => {
  test('Should be able to Write variables to the Variable Repository', () => {
    let collection = new Collection(); 
    expect(collection).toBeTruthy();
  });
});
