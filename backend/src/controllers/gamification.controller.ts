import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import gamificationService from '../services/gamification.service';
import StudentProfile from '../models/StudentProfile.model';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationService.getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBadges = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    res.json({ badges: profile?.badges || [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getXPHistory = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    res.json({ xp: profile?.xp || 0, level: profile?.currentLevel || 1 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
