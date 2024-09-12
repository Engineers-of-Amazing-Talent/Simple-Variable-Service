import jwt, { JwtPayload } from 'jsonwebtoken';
import repository from '../model';
import { UserInstance } from './userSchema';
const SECRET: string = process.env.AUTH_SECRET || 'svsdeveloper';

export type TokenPayload = {
  sub: string;
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