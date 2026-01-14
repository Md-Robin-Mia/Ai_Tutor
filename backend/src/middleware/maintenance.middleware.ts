import { Request, Response, NextFunction } from 'express';
import SystemSettings from '../models/SystemSettings.model';

export const checkMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get system settings
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    // Check if maintenance mode is enabled
    if (settings.maintenanceMode.enabled) {
      // Allow access to maintenance status endpoint
      if (req.path === '/api/system/maintenance-status') {
        return next();
      }

      // Allow access to health endpoints
      if (req.path === '/api/health' || req.path === '/health') {
        return next();
      }

      // Allow admin access if it's permitted and user is authenticated as admin
      if (settings.maintenanceMode.allowAdminAccess && req.user && (req.user as any).role === 'admin') {
        return next();
      }

      // Block all other requests
      return res.status(503).json({
        success: false,
        message: settings.maintenanceMode.message,
        maintenanceMode: true
      });
    }

    // Maintenance mode is disabled, proceed
    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // If there's an error, allow the request to proceed
    next();
  }
};
