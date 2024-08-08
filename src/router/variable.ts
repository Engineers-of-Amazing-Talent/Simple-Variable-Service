import express, { Router, Request, Response, NextFunction} from 'express';

const router: Router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

async function readVariables(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const { resourceId } = request.params;
      const query = await request.collection.read('Variable', { resourceId, include: 'Variable', includeAs: 'ListVariable' });
      if (query) {
        response.status(200).json({
          data: query.data
        });
      } else {
        response.status(404);
      }
    } else {
      next({ message: 'No Collection interface' });
    }
  } catch (e) {
    next({message: 'Variable Router Error: unable to read variable record', error: e });
  }
}

async function createVariable(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const query = await request.collection.write('Variable', {
        type: request.body.type,
        key: request.body.key,
        value: request.body.value
      });
      response.status(201).json({ resourceId: query.record.id });
    } else {
      next({ message: 'No Collection interface' });
    }
  } catch (e) {
    console.log(e);
    next({ message: 'Variable Router Error: unable to create variable record' , error: e });
  }
}
async function updateVariable(request: Request, response: Response, next: NextFunction) {
  response.send('UPDATE IN_PROGRESS');
}
async function deleteVariable(request: Request, response: Response, next: NextFunction) {
  response.send('DELETE IN_PROGRESS');
}

router.post('/variable', createVariable);
router.get('/variable/:resourceId', readVariables);
router.patch('/variable/:resourceId', updateVariable);
router.delete('/variable/:resourceId', deleteVariable);

export default router;
