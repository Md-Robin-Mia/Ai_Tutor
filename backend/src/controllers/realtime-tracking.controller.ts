import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { realTimeTrackingService } from '../services/realtime-tracking.service';

export const startStudySession = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { subject, topic, courseId, lessonId, moduleId } = req.body;
    const userId = req.user._id.toString();

    await realTimeTrackingService.startStudySession(userId, {
      subject,
      topic,
      courseId,
      lessonId,
      moduleId
    });

    return res.json({ success: true, message: 'Study session started' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const completeStudySession = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { subject, topic, duration, completionPercentage, quizScore, courseId, lessonId, moduleId } = req.body;
    const userId = req.user._id.toString();

    await realTimeTrackingService.completeStudySession(userId, {
      subject,
      topic,
      duration,
      completionPercentage,
      quizScore,
      courseId,
      lessonId,
      moduleId
    });

    return res.json({ success: true, message: 'Study session completed' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const trackQuizAttempt = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { quizId, score, totalPoints, percentage, passed, timeSpent, subject } = req.body;
    const userId = req.user._id.toString();

    await realTimeTrackingService.trackQuizAttempt(userId, {
      quizId,
      score,
      totalPoints,
      percentage,
      passed,
      timeSpent,
      subject
    });

    return res.json({ success: true, message: 'Quiz attempt tracked' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const trackLessonCompletion = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { courseId, lessonId, lessonTitle } = req.body;
    const userId = req.user._id.toString();

    await realTimeTrackingService.trackLessonCompletion(userId, {
      courseId,
      lessonId,
      lessonTitle
    });

    return res.json({ success: true, message: 'Lesson completion tracked' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Only allow admins to see all active sessions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const activeSessions = realTimeTrackingService.getActiveSessions();
    return res.json({ activeSessions });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
