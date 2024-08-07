import variableRouter from '../router/variable';
import supertest from 'supertest';
import testApp from './util/testApp';
import useCollection from '../router/middleware/useCollection';
import repository, { VariableInstance } from '../model';

let variable: VariableInstance | null = null;

beforeAll(async () => {
  let Variables = repository.getModel<VariableInstance>('Variable');
  variable = await Variables.create({
    type: 'STRING',
    key: 'ROUTER_TEST_KEY',
    value: 'ROUTER_TEST_VALUE'
  })
  testApp.use(useCollection);
  testApp.use(variableRouter);
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
  })
});
