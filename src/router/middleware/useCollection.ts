import { Request, Response, NextFunction } from 'express';
import { Collection } from '../../interface';
import repository from '../../model';

// configure the collection interface with the repository
const collection = new Collection(repository);
export function useCollection(request: Request, response: Response, next: NextFunction) {
  request.collection = collection;
  next();
}
