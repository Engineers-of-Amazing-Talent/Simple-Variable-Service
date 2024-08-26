import { ModelStatic } from 'sequelize';
import { Collection, QueryResponse } from '../interface';
import repository, { VariableInstance, isVariableInstance, ListItemInstance } from '../model';

let VariableModel: ModelStatic<VariableInstance> | null = null;
let ListItemModel: ModelStatic<ListItemInstance> | null = null;
let variableInstance: VariableInstance | null = null;
let listInstance: VariableInstance | null = null;

beforeAll(async () => {
  VariableModel = repository.getModel<VariableInstance>('Variable');
  ListItemModel = repository.getModel<ListItemInstance>('ListItem');
  variableInstance = await VariableModel.create({
    key: 'TEST_KEY',
    value: 'TEST_VALUE',
    type: 'STRING'
  });
  listInstance = await VariableModel.create({
    key: 'LIST_KEY',
    type: 'LIST'
  });
  await ListItemModel.create({
    listId: listInstance.id,
    resourceId: variableInstance.id
  });
});

describe('Collection Interface', () => {
  test('Should be able to Read variables from the Variable Repository', async () => {
    const collection = new Collection(repository); 
    expect(collection).toBeTruthy();

    if (variableInstance) {
      const response = await collection.read('Variable', { 
        resourceId: variableInstance.id
      });

      if (response && isVariableInstance(response.record)) {
        expect(response.data).toEqual('TEST_VALUE');
        expect(response.record.id).toBeTruthy();
        expect(response.record.key).toEqual('TEST_KEY');
        expect(response.record.value).toEqual('TEST_VALUE')
        expect(response.record.type).toEqual('STRING');
      }
    }
  });

  test('Should be able to Create variables using the Variable Repository', async () => {
    const collection = new Collection(repository); 

    const response: QueryResponse = await collection.write('Variable', { 
      type: 'STRING',
      value: 'TEST_VALUE',
      key: 'TEST_KEY'
    });

    if (isVariableInstance(response.record)) {
      expect(response.data).toEqual('TEST_VALUE');
      expect(response.record.id).toBeTruthy();
      expect(response.record.key).toEqual('TEST_KEY');
      expect(response.record.value).toEqual('TEST_VALUE');
    }
  });

  test('Should be able to Query a list item variable with list item value', async () => {
    const collection = new Collection(repository);

    if (listInstance) {
      const response = await collection.read('Variable', {
        resourceId: listInstance.id,
        include: 'Variable',
        as: 'ListVariable'
      });

      if (response && isVariableInstance(response.record)) {
        expect(response.data).toEqual({
          'TEST_KEY': 'TEST_VALUE'
        });
        expect(response.record.ListVariable).toBeTruthy();
        expect(response.record.ListVariable![0].key).toEqual('TEST_KEY');
        expect(response.record.ListVariable![0].value).toEqual('TEST_VALUE');
      }
    }
  });

  test('Should be able to attach a new Variable to a List', async () => {
    const collection = new Collection(repository);

    if (listInstance) {
      const number = await collection.write('Variable', {
        type: 'INTEGER',
        value: '12',
        key: 'LIST_NUMBER'
      });
      await collection.write('ListItem', {
        listId: listInstance.id,
        resourceId: number.record.id
      });

      const response = await collection.read('Variable', {
        resourceId: listInstance.id,
        include: 'Variable',
        as: 'ListVariable'
      });
      if (response && isVariableInstance(response.record)) {
        expect(response.data).toEqual({
          'TEST_KEY': 'TEST_VALUE',
          'LIST_NUMBER': 12
        });
        expect(response.record.ListVariable).toBeTruthy();
      }
    }
  });

  test('Should be able to create a nested list and read all values in the list', async () => {
    const collection = new Collection(repository);

    const valueTwo = await collection.write('Variable', {
      type: 'BOOLEAN',
      value: 'True',
      key: 'LEVEL_TWO_VALUE'
    });
    const listTwo = await collection.write('Variable', {
      type: 'LIST',
      key: 'LEVEL_TWO'
    });
    if (listInstance) {
      collection.write('ListItem', {
        listId: listInstance?.id,
        resourceId: listTwo.record.id
      });
      collection.write('ListItem', {
        listId: listTwo.record.id,
        resourceId: valueTwo.record.id
      });
      const query = await collection.read('Variable', {
        resourceId: listInstance.id,
        include: 'Variable',
        as: 'ListVariable'
      });

      expect(query?.data).toMatchObject({
        'LEVEL_TWO': {
          'LEVEL_TWO_VALUE': true
        },
      });
    }
  });
});
