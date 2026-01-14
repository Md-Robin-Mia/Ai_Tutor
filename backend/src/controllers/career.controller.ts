import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import StudentProfile from '../models/StudentProfile.model';
import aiService from '../services/ai.service';

export const getCareerAdvice = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const advice = await aiService.generateCareerAdvice(profile.skillsAssessed, profile.careerInterests);
    return res.json(advice);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitProject = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.projectsCompleted += 1;
    await profile.save();

    return res.json({ message: 'Project submitted successfully', projectsCompleted: profile.projectsCompleted });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCertificates = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    return res.json({ certificates: profile?.certificatesEarned || [] });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
