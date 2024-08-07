import * as express from 'express';
import { Collection } from './interface';

declare global {
  namespace Express {
    interface Request {
      collection?: Collection;
    }
  }
}