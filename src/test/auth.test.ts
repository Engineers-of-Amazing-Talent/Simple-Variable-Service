import repository from '../model';
import { UserInstance } from '../auth';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../auth';

const SECRET = process.env.AUTH_SECRET || 'svsdeveloper';

describe('Authentication and Authorization features', () => {
  test('Should be able to create a User with an Email, username, and password', async () => {
    const Users = repository.getModel<UserInstance>('User');
    const user = await Users.create({
      email: 'test@email.com',
      username: 'test',
      password: 'supersecret'
    });

    expect(user.id).toBeTruthy();
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
    const token = jwt.sign({ sub: authUser?.id }, SECRET);

    let validUser = await authenticateToken(token);
    expect(validUser.id).toEqual(authUser?.id);
    expect(validUser.email).toEqual(authUser?.email);
    expect(validUser.username).toEqual(authUser?.username);  
  });
});
