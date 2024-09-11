import express, { Router, Request, Response, NextFunction} from 'express';
import { validateRequestBody } from './middleware/validateRequestBody';

const router: Router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

async function readVariables(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const { resourceId } = request.params;
      const query = await request.collection.read('Variable', { resourceId, include: 'Variable', as: 'ListVariable' });
      if (query) {
        response.status(200).json({
          data: query.data
        });
      } else {
        next({ message: 'Not Found', status: 404 })
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
    if (!request.body.type || !request.body.key || (request.body.type !== 'LIST' && !request.body.value)) {
      next({ message: 'Invalid Variable Properties', status: 400 });
    }

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
    console.error(e);
    next({ message: 'Variable Router Error: unable to create variable record' , error: e });
  }
}
async function updateVariable(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const { resourceId } = request.params;
      const query = await request.collection.update('Variable', resourceId, request.body);
      if (query) {
        response.status(200).json(query);
      }
    } else {
      next({ message: 'No Collection interface'});
    }
  } catch (e) {
    next({ message: 'Variable Router Error:Unable to update variable record', error: e });
  }
}
async function deleteVariable(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const { resourceId } = request.params;
      const queryResponse = await request.collection.delete('Variable', resourceId);
      if (queryResponse === 0) {
        response.sendStatus(204);
      } else {
        next({ message: 'Variable not found', status: 404 });
      }
    } else {
      next({ message: 'No Collection interface' });
    }
  } catch (e) {
    console.error(e);
    next({ message: 'Variable Router Error:unable to remove Variable record', error: e });
  }
}

router.post('/', validateRequestBody, createVariable);
router.get('/:resourceId', readVariables);
router.patch('/:resourceId', validateRequestBody, updateVariable);
router.delete('/:resourceId', deleteVariable);

export default router;
