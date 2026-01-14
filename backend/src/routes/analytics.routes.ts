import express from 'express';
import { getDashboard, getReport, getWeakAreas, getRealTimeData } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/dashboard', authenticate, getDashboard);
router.get('/report/:type', authenticate, getReport);
router.get('/weak-areas', authenticate, getWeakAreas);
router.get('/realtime', authenticate, getRealTimeData);

export default router;
