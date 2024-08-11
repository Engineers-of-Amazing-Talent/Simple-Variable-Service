import { Request, Response, NextFunction } from 'express';

export const validateRequestBody = (request: Request, response: Response, next: NextFunction) => {
    if (!request.body || !Object.keys(request.body).length) {
      next({ message: 'Missing Request body', status: 400 });
    }
    next();
}