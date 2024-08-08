import variableRouter from '../router/variable';
import listItemRouter from '../router/listItem';
import supertest from 'supertest';
import testApp from './util/testApp';
import useCollection from '../router/middleware/useCollection';
import repository, { VariableInstance, ListItemInstance } from '../model';

let variable: VariableInstance | null = null;
let list: VariableInstance | null = null;

beforeAll(async () => {
  let Variables = repository.getModel<VariableInstance>('Variable');
  let ListItems = repository.getModel<ListItemInstance>('ListItem');
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
  testApp.use(variableRouter);
  testApp.use(listItemRouter);
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

  // TODO: Test for fetching a list that includes proper data attributes.
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

  // TODO: Test for fetching nested list variables with properly formatted nested json.
});
