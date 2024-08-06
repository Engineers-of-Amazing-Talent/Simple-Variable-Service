import variableRouter from '../router/variable';
import supertest from 'supertest';
import testApp from './util/testApp';
import useCollection from '../router/middleware/useCollection';

beforeAll(() => {
  testApp.use(useCollection);
  testApp.use(variableRouter);
});

describe('Service Router', () => {
  test('Should be able to respond with a status code from variable router', async () => {
    const request = supertest(testApp);

    const response = await request.get('/variable');
    expect(response.status).toBeTruthy();
  });

  test('Should be able to create a new resourceID from a POST to /variable', async () => {
    const request = supertest(testApp);

    const response = await request.post('/variable').send({
      type: 'STRING',
      key: 'TEST_KEY',
      value: 'TEST_VALUE'
    });

    expect(response.status).toEqual(201);
    expect(response.body.resourceId).toBeTruthy();
  });
});
