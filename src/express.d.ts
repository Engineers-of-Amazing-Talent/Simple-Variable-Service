import * as express from 'express';
import { Collection } from './interface';
import { UserInstance } from './auth';

declare global {
  namespace Express {
    interface Request {
      collection?: Collection;
      user?: UserInstance;
    }
  }
}