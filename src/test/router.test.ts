import variableRouter from '../router/variable';
import express from 'express';
import supertest from 'supertest';

const testApp = express();

beforeAll(() => {
 testApp.use(variableRouter);
});

describe('Service Router', () => {
  test('Should be able to respond with a status code from variable router', async () => {
    let request = supertest(testApp);

    let response = await request.get('/variable/1');
    expect(response.status).toBeTruthy();
  });
});
