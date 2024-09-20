import { Buffer } from 'node:buffer';
import express, { Request, Response, NextFunction } from 'express';
import { UserInstance, authenticateEmailPassword } from './';
import repository, { UserProfileInstance } from '../model';
const router = express.Router();

export async function handleRegistration(request: Request, response: Response, next: NextFunction) {
  try {
    const { email, username, password } = request.body;
    if (!email || !password) {
      next({ message: 'Invalid Request', status: 400 });
    }
    const Users = repository.getModel<UserInstance>('User');
    const UserProfile = repository.getModel<UserProfileInstance>('UserProfile');
    const user = await Users.create({ email, username, password });
    await UserProfile.create({ externalId: user.id });
    response.status(201).json({
      email: user.email,
      token: user.token
    })
  } catch (e) {
    next({ message: 'Unable to register new user', status: 500 });
  }
}

export async function handleBasic(request: Request, response: Response, next: NextFunction) {
  try {
    const base64Credentials = request.headers.authorization?.split(' ')[1];
    if (base64Credentials) {
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const [email, password] = decodedCredentials.split(':');
      const user = await authenticateEmailPassword(email, password);
      if (user) {
        response.status(200).send({ token: user.token });
      }
    } else {
      next({ message: 'Invalid Authorization credentials', status: 401 });
    }
    
  } catch(e) {
    next({ message: 'Basic Authentication Error', status: 500 });
  }
}

router.post('/user', handleRegistration);
router.post('/token', handleBasic);

export default router;
