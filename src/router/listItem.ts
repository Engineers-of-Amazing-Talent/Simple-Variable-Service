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
        data: query.data
      });
    } else {
      response.status(404);
    }
  } else {
    next({ message: 'No Collection interface' });
  }
}

async function writeListItem(request: Request, response: Response, next: NextFunction) {
  try {
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
    next({ message: 'ListItem Router Error: unable to create variable record', error: e });
  }
}

router.post('/listItem', writeListItem);
router.get('/listItem/:resourceId', readListItem);

export default router;
