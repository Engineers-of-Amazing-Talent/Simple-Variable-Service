import * as express from 'express';
import { Collection } from './interface';
import { UserInstance, CapabilityParam } from './auth';
import { UserProfileInstance } from './model';

declare global {
  namespace Express {
    interface Request {
      collection?: Collection;
      user?: UserInstance;
      profile?: UserProfileInstance;
      capability?: CapabilityParam;
    }
  }
}