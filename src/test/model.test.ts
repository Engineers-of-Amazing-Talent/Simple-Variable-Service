import { VariableInstance } from '../model/variable';
import { ListItemInstance } from '../model/listItem';
import repository, { isVariableInstance } from '../model';

afterEach(async () => {
  await repository.clean();
});

describe('Variable Repository', () => {
  test('Should be able to create a variable object', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    const object = await Variable.create({
      type: 'STRING',
      key: 'TEST_NAME',
      value: 'TEST_VALUE'  
    });

    expect(object.key).toEqual('TEST_NAME');
    expect(object.value).toEqual('TEST_VALUE');
    expect(object.type).toEqual('STRING');
  });

  test('Should throw an invalidation error when an improper Variable is made', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    await expect(
      Variable.create({
        type: 'INVALID',
        key: 'TEST_NAME',
        value: 'TEST_VALUE'
      })
    ).rejects.toThrow();

  });

  test('Should throw an error when a Variable lacks a value and not a list type', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    await expect(
      Variable.create({
        type: 'STRING',
        key: 'NO_VALUE'
      })
    ).rejects.toThrow();
  });

  test('Should be able to create a List Type Variables with a null value', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    const object = await Variable.create({
      type: 'LIST',
      key: 'TEST_LIST',
    });

    expect(object.type).toEqual('LIST');
    expect(object.key).toEqual('TEST_LIST');
    expect(object.value).toEqual(undefined);
  });

  test('Should be able to create a List Item to connect to a list Variable', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');
    const ListItem = repository.getModel<ListItemInstance>('ListItem');

    const listObject = await Variable.create({
      type: 'LIST',
      key: 'MY_LIST',
    });
    const valueObject = await Variable.create({
      type: 'STRING',
      value: 'TEST_VALUE',
      key: 'VALUE_1'
    });
    const listItem = await ListItem.create({
      listId: listObject.id,
      resourceId: valueObject.id,
    });

    expect(listItem.resourceId).toEqual(valueObject.id);
    expect(listItem.listId).toEqual(listObject.id);
    expect(listItem.id).toBeTruthy();
  });

  test('Should be able to query a List Variable and return all variables associated with the list', async () => {
      const Variable = repository.getModel<VariableInstance>('Variable');
      const ListItem = repository.getModel<ListItemInstance>('ListItem');

      const itemOne = await Variable.create({key: 'one', value: 'TEST_VALUE_ONE', type: 'STRING'});
      const itemTwo = await Variable.create({key: 'two', value: 'TEST_VALUE_TWO', type: 'STRING'});
      const listOne = await Variable.create({ key: 'TEST_VALUES', type: 'LIST'});
      await ListItem.create({ listId: listOne.id, resourceId: itemOne.id });
      await ListItem.create({ listId: listOne.id, resourceId: itemTwo.id });

      const listRecord = await Variable.findByPk(listOne.id, {
        include: [
          { model: Variable, as: 'ListVariable' }
        ]
      });
      expect(listRecord?.key).toEqual('TEST_VALUES');
      expect(listRecord?.ListVariable![0].key).toEqual('one');
      expect(listRecord?.ListVariable![1].key).toEqual('two');
      expect(listRecord?.ListVariable![0].value).toEqual('TEST_VALUE_ONE');
      expect(listRecord?.ListVariable![1].value).toEqual('TEST_VALUE_TWO');
  });

  test('Should be able to update individual variable values and query updated value in a list', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');
    const ListItem = repository.getModel<ListItemInstance>('ListItem');

    const itemOne = await Variable.create({ key: 'first', value: 'TEST_VALUE_ONE', type: 'STRING'});
    const itemTwo = await Variable.create({ key: 'parent', type: 'LIST' });
    await ListItem.create({ listId: itemTwo.id, resourceId: itemOne.id });

    let listRecord = await Variable.findByPk(itemTwo.id, {
      include: [
        { model: Variable, as: 'ListVariable' }
      ]
    });
    expect(listRecord?.ListVariable![0].value).toEqual('TEST_VALUE_ONE');

    await Variable.update({
      value: 'TEST_VALUE_UPDATED'
    }, { where: { id: itemOne.id } });

    listRecord = await Variable.findByPk(itemTwo.id, {
      include: [
        { model: Variable, as: 'ListVariable' }
      ]
    });
    expect(listRecord?.ListVariable![0].value).toEqual('TEST_VALUE_UPDATED');
  });

  test('Should be able to return a nested set of repository variable list instances', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');
    const ListItem = repository.getModel<ListItemInstance>('ListItem');
    
    const list1 = await Variable.create({
      key: 'LIST_1',
      type: 'LIST'
    });
    const list2 = await Variable.create({
      key: 'LIST_2',
      type: 'LIST'
    });
    const item1 = await Variable.create({
      key: 'LIST_1_ITEM_1',
      value: 'VALUE_ONE',
      type: 'STRING'
    });
    const item2 = await Variable.create({
      key: 'LIST_2_ITEM_2',
      value: 'VALUE_TWO',
      type: 'STRING'
    });
    await ListItem.create({
      listId: list1.id,
      resourceId: item1.id
    });
    await ListItem.create({
      listId: list1.id,
      resourceId: list2.id
    });
    await ListItem.create({
      listId: list2.id,
      resourceId: item2.id
    });

    const records = await repository.getLinkedInstances('Variable', list1.id, {
      as: 'ListVariable',
      include: 'Variable'
    });
    expect(records).toBeTruthy();
    if (records && isVariableInstance(records)) {
      expect(records.key).toEqual('LIST_1');
      expect(records?.ListVariable![0].key).toEqual('LIST_1_ITEM_1');
      expect(records?.ListVariable![1].key).toEqual('LIST_2');
      expect(records?.ListVariable![1].ListVariable![0].key).toEqual('LIST_2_ITEM_2');
    }
  });
  
  test('Should be able to delete an repository record', async () => {
    const model = repository.getModel<VariableInstance>('Variable');
    const recordToDelete = await model.create({
      key: 'VAR_1',
      value: 'DELETE_ME',
      type: 'STRING'
    });
    const count = await model.destroy({ where: { id: recordToDelete.id }});
    expect(count).toBeTruthy();
    expect(count).toEqual(1);
  })

  // validation
  test('Throws error for Variables of type FLOAT not using decimal numbers', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    expect(
      Variable.create({
        key: 'float',
        value: 'not a float',
        type: 'FLOAT'
      })
    ).rejects.toThrow();
    
  });
  test('Throws error for Variables of type FLOAT when containing non-numeric values', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    expect(
      Variable.create({
        key: 'float',
        value: 'not a float 5.4',
        type: 'FLOAT'
      })
    ).rejects.toThrow();

  });
  test('Variables of type FLOAT are correctly created when formatted properly', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    let float = await Variable.create({
      key: 'float',
      value: '1.23',
      type: 'FLOAT'
    });
  
    expect(float.value).toEqual('1.23');
  });
  test('Throws error when Variables of type INTEGER contain non integer values.', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    expect(
      Variable.create({
        key: 'integer',
        value: '1.23',
        type: 'INTEGER'
      })
    ).rejects.toThrow();

  });
  test('Throws error when Variables of type INTEGER contains any text characters.', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    expect(
      Variable.create({
        key: 'integer',
        value: 'hello 1',
        type: 'INTEGER'
      })
    ).rejects.toThrow();

  });
  test('Variables of type INTEGER are properly created when valid integer values are present.', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    let integer = await Variable.create({
      key: 'integer',
      value: '543',
      type: 'INTEGER'
    });
   
    expect(integer.value).toEqual('543');
  });
  test('Should throw an error when Variables of type BOOLEAN are not boolean values', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    expect(
      Variable.create({
        key: 'bool',
        value: 'not true',
        type: 'BOOLEAN'
      })
    ).rejects.toThrow();
    
  });
  test('Variables of type BOOLEAN are properly created when valid boolean values are present.', async () => {
    const Variable = repository.getModel<VariableInstance>('Variable');

    let integer = await Variable.create({
      key: 'bool',
      value: 'False',
      type: 'BOOLEAN'
    });

    expect(integer.value).toEqual('False');
  });
});

describe('Permissions and Access', () => {

  xtest('Should be able to create a Permission for a given resource', async () => {
    const Variable = repository.getModel('Variable');
    const Permissions = repository.getModel('Permission');
  });
});