import express, { Router } from 'express';
import variableRouter from './variable';
import listItemRouter from './listItem';
import { handleCapability, authRouter, handleAuthRequest, handleAuthorization } from '../auth';
import { handleUserProfile } from './middleware/handleUserProfile';
import { useCollection } from './middleware/useCollection';
import { errorHandler } from './middleware/errorHandler';

const apiRouter: Router = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use(handleCapability, useCollection);
variableRouter.param('resourceId', handleAuthorization);
apiRouter.use('/variable', handleAuthRequest, handleUserProfile, variableRouter);
apiRouter.use('/listItem', handleAuthRequest, handleUserProfile, listItemRouter);
apiRouter.use(errorHandler);

export default apiRouter;
