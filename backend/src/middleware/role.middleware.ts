import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User.model';
import { AuthRequest } from './auth.middleware';

export const requireRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  };
};

export const requireAnyRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  };
};
