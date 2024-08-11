import variableRouter from '../router/variable';
import listItemRouter from '../router/listItem';
import supertest from 'supertest';
import testApp from './util/testApp';
import { useCollection, errorHandler } from '../router';
import repository, { VariableInstance, ListItemInstance  } from '../model';

let variable: VariableInstance | null = null;
let deleteMe: VariableInstance | null = null;
let list: VariableInstance | null = null;

beforeAll(async () => {
  let Variables = repository.getModel<VariableInstance>('Variable');
  let ListItems = repository.getModel<ListItemInstance>('ListItem');
  deleteMe = await Variables.create({
    type: 'STRING',
    key: 'DELETE_KEY',
    value: 'DELETE_VALUE'
  });
  variable = await Variables.create({
    type: 'STRING',
    key: 'ROUTER_TEST_KEY',
    value: 'ROUTER_TEST_VALUE'
  });
  list = await Variables.create({
    key: 'ROUTER_TEST_LIST_KEY',
    type: 'LIST'
  });
  await ListItems.create({
    listId: list.id,
    resourceId: variable.id
  });
  testApp.use(useCollection);
  testApp.use('/variable', variableRouter);
  testApp.use('/listItem', listItemRouter);
  testApp.use(errorHandler);
});

describe('Service Router', () => {
  test('Should be able to respond with a status code from GET variable router', async () => {
    const request = supertest(testApp);

    const response = await request.get('/variable');
    expect(response.status).toBeTruthy();
  });

  test('Should be able to create a new resourceID from a POST to /variable', async () => {
    const request = supertest(testApp);

    const response = await request.post('/variable').send({
      type: 'STRING',
      key: 'POST_TEST_KEY',
      value: 'POST_TEST_VALUE'
    });

    expect(response.status).toEqual(201);
    expect(response.body.resourceId).toBeTruthy();
  });

  test('Should be able to read an existing resource on GET to /variable/:resourceId', async () => {
    const request = supertest(testApp);
    const response = await request.get(`/variable/${variable?.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual('ROUTER_TEST_VALUE')
  });

  test('Should be able to read a list and include list values as data', async () => {
    const request = supertest(testApp);
    const response = await request.get(`/variable/${list?.id}`);
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      'ROUTER_TEST_KEY': 'ROUTER_TEST_VALUE'
    });
  });
  test('Should be able to add a variable to a list and fetch updated values', async () => {
    const request = supertest(testApp);

    const newVarResponse = await request.post('/variable').send({
      key: 'POST_TEST_KEY',
      value: 'POST_TEST_VALUE',
      type: 'STRING'
    });
    const newItemResponse = await request.post('/listItem').send({
      listId: list?.id,
      resourceId: newVarResponse.body.resourceId
    });
    expect(newItemResponse.status).toEqual(201);
    const listResponse = await request.get(`/variable/${list?.id}`);
    expect(listResponse.status).toEqual(200);
    expect(listResponse.body.data).toEqual({
      'ROUTER_TEST_KEY': 'ROUTER_TEST_VALUE',
      'POST_TEST_KEY': 'POST_TEST_VALUE'
    });
  });

  test('Should be able to fetch nested data entities on GET /variable', async () => {
    const request = supertest(testApp);

    const newListResponse = await request.post('/variable').send({
      key: 'LIST_2',
      type: 'LIST',
    });
    const listValueResponse = await request.post('/variable').send({
      key: 'NESTED_KEY',
      value: 'NESTED_VALUE',
      type: 'STRING'
    });
    await request.post('/listItem').send({
      listId: newListResponse.body.resourceId,
      resourceId: listValueResponse.body.resourceId
    })
    await request.post('/listItem').send({
      listId: list?.id,
      resourceId: newListResponse.body.resourceId
    });
    const oldListResponse = await request.get(`/variable/${list?.id}`);
    expect(oldListResponse.status).toEqual(200);
    expect(oldListResponse.body.data).toMatchObject({
      'LIST_2': {
        'NESTED_KEY': 'NESTED_VALUE'
      }
    });
  });

  test('Should be able to update an existing variable via PATCH to /variable', async () => {
    const request = supertest(testApp);

    const variableResponse = await request.patch(`/variable/${variable?.id}`).send({
      value: 'ROUTER_UPDATE_VALUE'
    });

    expect(variableResponse.status).toEqual(200);
    expect(variableResponse.body.values).toEqual({value: 'ROUTER_UPDATE_VALUE'});
    const listResponse = await request.get('/variable/' +  list?.id);
    expect(listResponse.body.data).toMatchObject({
      'ROUTER_TEST_KEY': 'ROUTER_UPDATE_VALUE'
    });
  });

  test('Should be able to delete a variable with DELETE /variable', async () => {
    const request = supertest(testApp);

    const response = await request.delete(`/variable/${deleteMe?.id}`);
    expect(response.status).toEqual(204);
  });
  test('Should be able to successfully DELETE /variable that a list item.', async () => {
    const request = supertest(testApp);

    const variableResponse = await request.post('/variable').send({
      type: 'STRING',
      key: 'DELETE_LIST_ITEM',
      value: 'DELETE_ME'
    });
    await request.post('/listItem').send({
      listId: list?.id,
      resourceId: variableResponse.body.resourceId
    });
    const deleteResponse = await request.delete(`/variable/${variableResponse.body.resourceId}`);

    expect(deleteResponse.status).toEqual(204);
  })

  // Error Handling
  test('Should return a status 404 for non-existent variable', async () => {
    let request = supertest(testApp);

    let response = await request.get('/variable/12345');
    expect(response.status).toEqual(404);
  });
  test('Should return a 400 for missing request body on POST', async () => {
    const request = supertest(testApp);
    const response = await request.post('/variable');
    expect(response.status).toEqual(400);
  });
});
