import { Buffer } from 'node:buffer';
import repository, {
  UserProfileInstance,
  PermissionInstance,
  VariableInstance,
} from '../model';
import {
  UserInstance,
  authenticateToken,
  authorizeUser,
  authRouter,
  handleAuthRequest,
  handleCapability,
  handleAuthorization,
  authorizeListItem
} from '../auth';
import supertest from 'supertest';
import testApp from './util/testApp';
import { useCollection } from '../router/middleware/useCollection';
import { handleUserProfile } from '../router/middleware/handleUserProfile';
import { errorHandler } from '../router/middleware/errorHandler';
import variableRouter from '../router/variable';
import listItemRouter from '../router/listItem';

beforeAll(() => {
  testApp.use('/auth', authRouter);
  testApp.use(handleCapability, useCollection);
  variableRouter.param('resourceId', handleAuthorization);
  testApp.use('/variable',
    handleAuthRequest,
    handleUserProfile,
    variableRouter);
  listItemRouter.param('resourceId', handleAuthorization);
  testApp.use('/listItem',
    handleAuthRequest,
    handleUserProfile,
    (req, res, next) => {
      if (req.method === 'POST') {
        authorizeListItem(req, res, next);
      } else {
        next();
      }
    },
    listItemRouter);
  testApp.use(errorHandler);
});
afterEach(async () => {
  repository.clean();
});

describe('Authentication and Authorization features', () => {
  test('Should be able to create a User with an Email, username, and password', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const user = await Users.create({
      email: 'test@email.com',
      username: 'test',
      password: 'supersecret'
    });

    expect(user.id).toBeTruthy();
    expect(user.token).toBeTruthy();
    expect(user.email).toEqual('test@email.com');
    expect(user.username).toEqual('test');
    expect(user.password).not.toEqual('supersecret');
  });

  test('Should throw an error when no email is present', async () => {
    const Users = repository.getModel<UserInstance>('User');
    await expect(
      Users.create({
        username: 'test',
        password: 'secretstring'
      })
    ).rejects.toThrow();
  });
  test('Should throw an error when an invalid email is submitted as a user', async () => {
    const Users = repository.getModel<UserInstance>('User');
    await expect(
      Users.create({
        email: 'notanemail',
        username: 'test',
        password: 'secretstring'
      })
    ).rejects.toThrow();
  });

  test('Should authenticate a token string and return a valid User Instance', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const authUser = await Users.create({
      email: 'TEST@test.com',
      username: 'tester',
      password: 'test'
    });

    let validUser = await authenticateToken(authUser.token);
    expect(validUser.id).toEqual(authUser?.id);
    expect(validUser.email).toEqual(authUser?.email);
    expect(validUser.username).toEqual(authUser?.username);  
  });
  test('Should authorize users who have valid Permissions', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const UserProfile = repository.getModel<UserProfileInstance>('UserProfile');
    const Permissions = repository.getModel<PermissionInstance>('Permission');
    const Variable = repository.getModel<VariableInstance>('Variable');

    const authUser = await Users.create({
      email: 'owner@test.com',
      password: 'ownership',
    });
    const userProfile = await UserProfile.create({
      externalId: authUser.id
    });
    const resource = await Variable.create({
      type: 'STRING',
      key: 'test',
      value: 'this belongs to someone'
    })
    Permissions.create({
      capability: 'OWNER',
      userId: userProfile.id,
      resourceId: resource.id
    });
    
    const authorization = await authorizeUser(userProfile, resource.id, 'READ');
    expect(authorization).toEqual(true);
  });
  test('Should return FALSE for a resource that lacks permission for a resource', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const UserProfile = repository.getModel<UserProfileInstance>('UserProfile');
    const Variable = repository.getModel<VariableInstance>('Variable');

    const authUser = await Users.create({
      email: 'user@test.com',
      password: 'user',
    });
    const userProfile = await UserProfile.create({
      externalId: authUser.id
    });
    const resource = await Variable.create({
      type: 'BOOLEAN',
      key: 'test_key',
      value: 'false'
    });

    const authorization = await authorizeUser(userProfile, resource.id, 'READ');
    expect(authorization).toEqual(false);
  });
  test('Should return FALSE for a user that is not granted specific capability permissions', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const UserProfile = repository.getModel<UserProfileInstance>('UserProfile');
    const Permissions = repository.getModel<PermissionInstance>('Permission');
    const Variable = repository.getModel<VariableInstance>('Variable');

    const authUser = await Users.create({
      email: 'reader@test.com',
      password: 'Icanread',
    });
    const userProfile = await UserProfile.create({
      externalId: authUser.id
    });
    const resource = await Variable.create({
      type: 'STRING',
      key: 'test_string',
      value: 'Here is something to read'
    })
    Permissions.create({
      capability: 'READ',
      userId: userProfile.id,
      resourceId: resource.id
    });

    const authorized = await authorizeUser(userProfile, resource.id, 'UPDATE');
    expect(authorized).toEqual(false);
  });
});

describe('Auth router routes and capabilities', () => {
  test('Should be able to sign up a new user with email and password', async () => {
    const request = supertest(testApp);
    const response = await request.post('/auth/user').send({
      email: 'test@test.com',
      username: 'test user',
      password: 'testpassword',
    })
    expect(response.status).toEqual(201);
    expect(response.body.email).toEqual('test@test.com');
    expect(response.body.token).toBeTruthy();
  });
  test('Should be able to exchange a registered users email and password for a token', async () => {
    const Users = repository.getModel<UserInstance>('User');
    await Users.create({
      email: 'test@test.com',
      password: 'test_password'
    });
    const request = supertest(testApp);
    const base64Credentials = Buffer.from(`test@test.com:test_password`).toString('base64');

    const response = await request.post('/auth/token').set('Authorization', `Basic ${base64Credentials}`);
    expect(response.status).toEqual(200);
    expect(response.body.token).toBeTruthy();
  });
  test('Should allow a user to create a variable with a valid token', async () => {
    const Users = repository.getModel<UserInstance>('User');
    await Users.create({
      email: 'test@test.com',
      password: 'test_password'
    });
    const request = supertest(testApp);
    const base64Credentials = Buffer.from(`test@test.com:test_password`).toString('base64');

    const tokenResponse = await request.post('/auth/token').set('Authorization', `Basic ${base64Credentials}`);
    const { token } = tokenResponse.body;

    const resourceResponse = await request.post('/variable')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'STRING', key: 'test_resource', value: 'test_value' });
    expect(resourceResponse.status).toEqual(201);
  });
  test('Should return a 401 when a user makes a request without a token', async () => {
    const request = supertest(testApp);
    const response = await request.post('/variable')
      .send({ type: 'STRING', key: 'test_resource', value: 'test_value' });  
    expect(response.status).toEqual(401);
  });
  test('Should return a 403 when requesting a variable that lacks user permission', async () => {
    const request = supertest(testApp);
    const Users = repository.getModel<UserInstance>('User');
    const UserProfile = repository.getModel<UserProfileInstance>('UserProfile');
    const Variable = repository.getModel<VariableInstance>('Variable');

    const user = await Users.create({
      email: 'test@test.com',
      password: 'test_password',
    });
    await UserProfile.create({
      externalId: user.id
    });
    const resource = await Variable.create({
      type: 'FLOAT',
      key: 'test_key',
      value: '1.111'
    });

    const response = await request.get(`/variable/${resource.id}`).set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toEqual(403);
  });
  test('Should return resource when requesting a variable with proper permissions', async () => {
    const request = supertest(testApp);
    const createUser = await request.post('/auth/user').send({
      email: 'test@test.com',
      password: 'test_password'
    });
    const createVariable = await request.post('/variable')
      .set('Authorization', `Bearer ${createUser.body.token}`)
      .send({
        type: 'STRING',
        key: 'My test string',
        value: 'test string value'
      });

    const getVariable = await request.get(`/variable/${createVariable.body.resourceId}`).set('Authorization', `Bearer ${createUser.body.token}`);
    expect(getVariable.status).toEqual(200);
    expect(getVariable.body.data).toEqual('test string value');
  });
  test('Should allow users with OWNER capability to modify a list', async () => {
    const request = supertest(testApp);

    const createUser = await request.post('/auth/user').send({
      email: 'test_user@test.com',
      password: 'test_password'
    });
    const token = createUser.body.token;

    const createList = await request.post('/variable')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'LIST',
        key: 'test_list'
      });
    const createString = await request.post('/variable')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'STRING',
        key: 'TEST_KEY',
        value: 'TEST_VALUE'
      });
    const createListItem = await request.post('/listItem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: createString.body.resourceId,
        listId: createList.body.resourceId
      });
    expect(createListItem.status).toEqual(201);
  });
  test('Should return a 403 on requests that make list items on resources that lacks permissions', async () => {
    const request = supertest(testApp);
    const Variable = repository.getModel<VariableInstance>('Variable');
    const list = await Variable.create({
      type: 'LIST',
      key: 'NOT_PERMITTED',
    });

    const createUser = await request.post('/auth/user')
      .send({
        email: 'test@test.com',
        password: 'password'
      });
    const createVariable = await request.post('/variable')
      .set('Authorization', `Bearer ${createUser.body.token}`)
      .send({
        type: 'STRING',
        key: 'STRING_KEY',
        value: 'string_value'
      });
    const createListItem = await request.post('/listItem')
      .set('Authorization', `Bearer ${createUser.body.token}`)
      .send({
        resourceId: createVariable.body.resourceId,
        listId: list.id
      });
    expect(createListItem.status).toEqual(403);
  });
});
