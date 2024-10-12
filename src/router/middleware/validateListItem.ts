import { Request, Response, NextFunction } from 'express';
import { isVariableInstance } from '../../model';

export async function validateListItem(request: Request, response: Response, next: NextFunction) {
  try {
    const { listId, resourceId } = request.body;
    if (!listId || !resourceId) {
      next({ message: 'Invalid List Item Request', status: 400 });
    }
    if (request.collection) {
      const query = await request.collection.read('Variable', {
        resourceId: request.body.listId
      });
      if (query && isVariableInstance(query.record)) {
        if (query.record.type !== 'LIST') {
          next({message: 'Invalid List ID', status: 400 });
        }
      } else {
        next({ message: 'List not found', status: 404 });
      }
      next();
    }
  } catch(e) {
    next({ message: 'List Item Validation Error', status: 500 });
  }
}
