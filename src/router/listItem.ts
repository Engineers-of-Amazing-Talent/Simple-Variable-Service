import express, { Router, Request, Response, NextFunction } from 'express';

const router: Router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

async function readListItem(request: Request, response: Response, next: NextFunction) {
  if (request.collection) {
    const { resourceId } = request.params;
    const query = await request.collection.read('ListItem', { resourceId });
    if (query) {
      response.status(200).json({
        record: query.record
      });
    } else {
      next({ message: 'List Item not Found', status: 404 });
    }
  } else {
    next({ message: 'No Collection interface' });
  }
}

async function writeListItem(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.body.resourceId || !request.body.listId) {
      next({ message: 'Invalid ListItem Properties', status: 400 });
    }

    if (request.collection) {
      const query = await request.collection.write('ListItem', {
        resourceId: request.body.resourceId,
        listId: request.body.listId,
      });
      response.status(201).json({ resourceId: query.record.id });
    } else {
      next({ message: 'No Collection interface' });
    }
  } catch (e) {
    console.log(e);
    next({ message: 'ListItem Router Error:unable to create listItem record', error: e });
  }
}

async function deleteListItem(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.collection) {
      const { resourceId } = request.params;
      const queryResponse = await request.collection.delete('ListItem', resourceId);
      if (queryResponse === 0) {
        response.sendStatus(204);
      } else {
        next({ message: 'List Item not found', status: 404 });
      }
    } else {
      next({ message: 'No Collection interface'});
    }
  } catch(e) {
    console.log(e);
    next({ message: 'ListItem Router Error:unable to remove listItem record', error: e });
  }
}

router.post('/', writeListItem);
router.get('/:resourceId', readListItem);
router.delete('/:resourceId', deleteListItem);

export default router;
