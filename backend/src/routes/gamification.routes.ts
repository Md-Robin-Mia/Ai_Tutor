import express from 'express';
import { getLeaderboard, getBadges, getXPHistory } from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/leaderboard', authenticate, getLeaderboard);
router.get('/badges', authenticate, getBadges);
router.get('/xp/history', authenticate, getXPHistory);

export default router;
