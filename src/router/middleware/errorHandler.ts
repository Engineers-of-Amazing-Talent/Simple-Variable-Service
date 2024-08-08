import { Request, Response, NextFunction } from 'express';

export interface RequestError {
  status?: number;
  message: string;
  error?: Error;
}

export function errorHandler(err: RequestError, request: Request, response: Response, next: NextFunction) {

  const statusMessage = err?.error?.message || err.message || 'Unknown Server Error';
  response.status(err.status || 500).send(statusMessage);
}