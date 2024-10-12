import express, { Router } from 'express';
import variableRouter from './variable';
import listItemRouter from './listItem';
import {
  handleCapability,
  authRouter,
  handleAuthRequest,
  handleAuthorization,
  authorizeListItem,
} from '../auth';
import { handleUserProfile } from './middleware/handleUserProfile';
import { useCollection } from './middleware/useCollection';
import { errorHandler } from './middleware/errorHandler';

const apiRouter: Router = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use(handleCapability, useCollection);

variableRouter.param('resourceId', (req, res, next) => {
  if (req.path.includes('v2')) {
    handleAuthorization(req, res, next);
  } else {
    next();
  }
});
apiRouter.use('/variable',
  handleAuthRequest,
  handleUserProfile,
  variableRouter
);

listItemRouter.param('resourceId', (req, res, next) => {
  if (req.path.includes('v2')) {
    handleAuthorization(req, res, next);
  } else {
    next();
  }
});
apiRouter.use('/listItem',
  handleAuthRequest,
  handleUserProfile,
  (req, res, next) => {
    if (req.method === 'POST') {
      authorizeListItem(req, res, next);
    } else {
      next();
    }
  },
  listItemRouter
);

apiRouter.use(errorHandler);

export default apiRouter;
