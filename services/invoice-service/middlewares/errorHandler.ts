// Type declarations for Node.js globals
declare const process: any;

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}



export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  const error = err as any;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  console.error('Error:', error);
  
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
