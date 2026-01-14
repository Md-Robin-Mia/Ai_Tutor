import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  retryable?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      message: 'Database connection lost. Please try again.',
      code: 'DATABASE_ERROR',
      retryable: true,
      timestamp: new Date().toISOString()
    });
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid input data',
      code: 'VALIDATION_ERROR',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT expiration errors
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication token expired',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString()
    });
  }

  // Handle rate limiting errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryable: true,
      timestamp: new Date().toISOString()
    });
  }

  // Handle default server errors
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    message,
    code: err.code || 'INTERNAL_ERROR',
    retryable: err.retryable || false,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const databaseConnectionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('Database not connected. Current state:', mongoose.connection.readyState);
    
    // Allow certain endpoints to work without database
    const publicEndpoints = [
      '/api/health',
      '/health',
      '/api/auth/google',
      '/api/auth/google/callback',
      '/api/collaboration/groups' // Allow collaboration endpoints for testing
    ];
    
    if (publicEndpoints.includes(req.path) || req.path.startsWith('/api/collaboration/')) {
      console.log('Allowing collaboration endpoint without database connection');
      return next();
    }
    
    return res.status(503).json({
      message: 'Database service unavailable. Please try again later.',
      code: 'DATABASE_DISCONNECTED',
      retryable: true,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
