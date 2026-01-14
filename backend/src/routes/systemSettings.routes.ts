import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import {
  getSystemSettings,
  updateSystemSettings,
  toggleMaintenanceMode,
  getMaintenanceStatus
} from '../controllers/systemSettings.controller';

const router = Router();

// Public endpoint for maintenance status
router.get('/maintenance-status', getMaintenanceStatus);

// Apply authentication and admin requirement to remaining routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all system settings
router.get('/', getSystemSettings);

// Update system settings
router.put('/', updateSystemSettings);

// Toggle maintenance mode
router.put('/maintenance', toggleMaintenanceMode);

export default router;
