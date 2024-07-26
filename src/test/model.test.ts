import { IRepository, Variable } from '../model';

describe('Variable Repository', () => {
  test('Should be able to create a variable object', async () => {
    let object = await Variable.create({
      type: 'string',
      name: 'TEST_NAME',
      value: 'TEST_VALUE'  
    });

    expect(object.value).toEqual('TEST_VALUE');
    expect(object.name).toEqual('TEST_NAME');
    expect(object.type).toEqual('string');
  });
});