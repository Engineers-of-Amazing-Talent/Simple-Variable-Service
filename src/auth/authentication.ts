import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import repository from '../model';
import { UserInstance } from './userSchema';
const SECRET: string = process.env.AUTH_SECRET || 'svsdeveloper';

export type TokenPayload = {
  sub: string;
}

export async function authenticateEmailPassword(email: string, password: string): Promise<UserInstance> {
  try {
    const Users = repository.getModel<UserInstance>('User');
    const user = await Users.findOne({ where: { email }});
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return user;
      } else {
        throw new Error('Authentication error:invalid email or password');  
      }
    } else {
      throw new Error('Authentication error:invalid email or password');
    }
  } catch(e) {
    console.error(e);
    throw new Error('Unable to validate email and Password');
  }
}

export async function authenticateToken(token: string): Promise<UserInstance>  {

  try {
    const payload: JwtPayload | string = await jwt.verify(token, SECRET) as TokenPayload;
    if (payload && payload.sub) {
      const userModel = repository.getModel<UserInstance>('User');
      const user = await userModel.findByPk(payload.sub);
      if (user) {
        return user;
      } else {
        throw new Error('Invalid Authentication Token');
      }
    }
    else {
      throw new Error('Invalid token payload');
    }
  } catch (e) {
    console.error(e);
    throw new Error('Token Authentication Error');
  }
}

export async function handleAuthRequest(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.headers.authorization) {
      next({ message: 'Unauthenticated', status: 401 });
      return;
    }
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      const validUser = await authenticateToken(token);
      if (validUser) {
        request.user = validUser;
        next();
      } else {
        next({ message: 'Invalid Credentials', status: 401 });
      }
    }
  } catch(e) {
    next({ message: 'Authentication Error', status: 500 });
  }
}