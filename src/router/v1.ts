import express, { Router } from 'express';
import variableRouter from './variable';
import listItemRouter from './listItem';
import { useCollection } from './middleware/useCollection';
import { errorHandler } from './middleware/errorHandler';

const apiRouter: Router = express.Router();

apiRouter.use(useCollection);
apiRouter.use('/variable', variableRouter);
apiRouter.use('/listItem', listItemRouter);
apiRouter.use(errorHandler);

export default apiRouter;
