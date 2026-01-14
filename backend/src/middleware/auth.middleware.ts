import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: any; // Keep as any for now since it comes from mongoose
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        message: 'Authentication required',
        errorType: 'AUTHENTICATION_REQUIRED',
        details: 'You need to be logged in to view this course'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({ 
        message: 'Invalid or inactive user',
        errorType: 'INVALID_USER',
        details: 'Your account is not active or the authentication token is invalid'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({ 
      message: 'Invalid token',
      errorType: 'INVALID_TOKEN',
      details: 'Your authentication token is invalid or has expired'
    });
  }
};

export const authorize = (...roles: (UserRole | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        message: 'Authentication required',
        errorType: 'AUTHENTICATION_REQUIRED',
        details: 'You need to be logged in to access this resource'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: 'Access denied',
        errorType: 'PERMISSION_DENIED',
        details: 'You don\'t have permission to access this resource. This may require a different user role.'
      });
      return;
    }

    next();
  };
};

// Alternative function names for compatibility
export const authenticateToken = authenticate;
export const requireRole = authorize;

// Create requireAdmin function with type casting
export const requireAdmin = authorize('admin' as UserRole);

// Optional authentication middleware - doesn't fail if no token provided
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      // Invalid token, but continue without user for optional auth
      next();
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    // Invalid token, but continue without user for optional auth
    console.error('Optional authentication middleware error:', error);
    next();
  }
};
