import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import aiService from '../services/ai.service';
import User, { LanguageMode } from '../models/User.model';
import StudentProfile from '../models/StudentProfile.model';

export const teach = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { subject, topic } = req.body;
    const user = await User.findById(req.user._id);
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = await aiService.generateTeachingResponse({
      studentName: user.name,
      age: user.age || 18,
      level: profile?.level || 'beginner',
      languageMode: user.languageMode,
      learningStyle: user.learningStyle,
      subject,
      topic,
      weakAreas: profile?.weakAreas,
      dyslexiaMode: user.dyslexiaMode
    });

    return res.json({ response });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { subject, topic, difficulty, questionCount, questionTypes } = req.body;
    const user = await User.findById(req.user._id);

    const quiz = await aiService.generateQuiz({
      subject,
      topic,
      difficulty: difficulty || 'medium',
      questionCount: questionCount || 5,
      questionTypes: questionTypes || ['mcq'],
      languageMode: user?.languageMode || LanguageMode.ENGLISH
    });

    return res.json({ quiz });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMotivation = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.user._id);
    const message = await aiService.generateMotivation(user?.name || 'Student', user?.languageMode || LanguageMode.ENGLISH);
    return res.json({ message });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const evaluateHandwriting = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { imageBase64 } = req.body;
    const result = await aiService.evaluateHandwriting(imageBase64);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const explainDiagram = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    return res.json({ explanation: 'Diagram explanation feature coming soon' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
