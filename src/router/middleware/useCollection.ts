import { Request, Response, NextFunction } from 'express';
import { Collection } from '../../interface';
import repository from '../../model';

const collection = new Collection(repository);

// configure the collection interface with the repository
export default function useCollection(request: Request, response: Response, next: NextFunction) {
  request.collection = collection;
  next();
}
