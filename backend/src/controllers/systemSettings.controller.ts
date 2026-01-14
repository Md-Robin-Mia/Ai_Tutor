import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings.model';

// Get system settings
export const getSystemSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update system settings
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings first
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    // Update settings with provided data
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
          // Handle nested objects
          settings[key] = { ...settings[key], ...updates[key] };
        } else {
          // Handle direct properties
          settings[key] = updates[key];
        }
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle maintenance mode
export const toggleMaintenanceMode = async (req: Request, res: Response) => {
  try {
    const { enabled, message, allowAdminAccess } = req.body;
    
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings first
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    // Update maintenance mode settings
    if (enabled !== undefined) {
      settings.maintenanceMode.enabled = enabled;
    }
    if (message !== undefined) {
      settings.maintenanceMode.message = message;
    }
    if (allowAdminAccess !== undefined) {
      settings.maintenanceMode.allowAdminAccess = allowAdminAccess;
    }

    await settings.save();

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      settings
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get maintenance mode status
export const getMaintenanceStatus = async (_req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    
    // If no settings exist, create default settings first
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    res.json({
      success: true,
      maintenanceMode: settings.maintenanceMode
    });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
