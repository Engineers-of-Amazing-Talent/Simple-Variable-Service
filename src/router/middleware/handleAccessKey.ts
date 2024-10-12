import { Request, Response, NextFunction } from 'express';

export async function handleAccessKey(request: Request, response: Response, next: NextFunction) {
  try {
    if (request.query.accessKey) {
      // get the access key from repository
      // validate the access key resourceID matches the request parameter.
    }
  } catch (e) {
    next({ message: 'Invalid Access Key', status: 403 });
  }
}