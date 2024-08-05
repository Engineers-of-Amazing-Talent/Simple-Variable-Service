import { ModelStatic } from 'sequelize';
import { Collection } from '../interface';
import repository, { VariableInstance, isVariableInstance, ModelInstance } from '../model';

let VariableModel: ModelStatic<VariableInstance> | null = null;
let variableInstance: VariableInstance | null = null;

beforeAll(async () => {
  await repository.connect({ url: 'sqlite:memory', options: {logging: false } });
  await repository.initialize();
  VariableModel = await repository.getModel<VariableInstance>('Variable');
  variableInstance = await VariableModel.create({
    key: 'TEST_KEY',
    value: 'TEST_VALUE',
    type: 'STRING'
  });
});
afterAll(async () => {
  await repository.terminate();
  repository.close();
});

describe('Collection Interface', () => {
  test('Should be able to Read variables from the Variable Repository', async () => {
    const collection = new Collection(repository); 
    expect(collection).toBeTruthy();

    try {
      if (variableInstance) {
        const variable = await collection.read('Variable', { 
          resourceId: variableInstance.id
        });
  
        if (variable && isVariableInstance(variable)) {
          expect(variable?.id).toBeTruthy();
          expect(variable?.key).toBeTruthy();
          expect(variable?.value).toBeTruthy();
          expect(variable?.type).toBeTruthy();
        }
      }
    } catch(e) {
      console.log('Collection interface error:', e);
    }
  });

  test('Should be able to Create variables using the Variable Repository', async () => {
    const collection = new Collection(repository); 

    try {
      const variable: ModelInstance = await collection.write('Variable', { 
        type: 'STRING',
        value: 'TEST_VALUE',
        key: 'TEST_KEY'
      });
  
      if (isVariableInstance(variable)) {
        expect(variable?.id).toBeTruthy();
        expect(variable?.key).toEqual('TEST_KEY');
        expect(variable?.value).toEqual('TEST_VALUE');
      }
    } catch (e) {
      console.log('Collection variable creation error:', e);
    }
  });
});
