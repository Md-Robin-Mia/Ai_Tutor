import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import StudentProfile from '../models/StudentProfile.model';
import gamificationService from '../services/gamification.service';
import { studentSocketService } from '../services/studentSocket.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId');
    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    const profile = await StudentProfile.findOneAndUpdate({ userId: req.user._id }, updates, { new: true });
    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, type, targetDate } = req.body;
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.goals.push({ title, description, type, targetDate, progress: 0, isCompleted: false, createdAt: new Date() });
    await profile.save();

    res.json({ goal: profile.goals[profile.goals.length - 1] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const { progress, isCompleted } = req.body;
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const goal = profile.goals.find((g: any) => g._id?.toString() === goalId);
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    if (progress !== undefined) goal.progress = progress;
    if (isCompleted !== undefined) {
      goal.isCompleted = isCompleted;
      if (isCompleted) {
        await gamificationService.awardXP(req.user._id.toString(), 100, 'Goal completed');
      }
    }

    await profile.save();
    res.json({ goal });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const recordSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topic, duration, completionPercentage, quizScore } = req.body;
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.studySessions.push({ subject, topic, duration, completionPercentage, quizScore, timestamp: new Date() });
    profile.totalStudyTime += duration;

    if (!profile.subjects.includes(subject)) {
      profile.subjects.push(subject);
    }

    await profile.save();

    await gamificationService.updateStreak(req.user._id.toString());
    const xp = gamificationService.calculateXPForActivity('lesson_complete', completionPercentage);
    await gamificationService.awardXP(req.user._id.toString(), xp, 'Lesson completed');

    // Emit real-time activity to teachers
    const studentName = `${req.user.firstName || 'Student'} ${req.user.lastName || ''}`.trim() || req.user.email?.split('@')[0] || 'Student';
    
    if (completionPercentage >= 100) {
      // Lesson completed
      studentSocketService.emitLessonComplete(
        req.user._id.toString(),
        studentName,
        {
          lessonTitle: topic,
          course: subject,
          progress: completionPercentage,
          timeSpent: duration
        }
      );
    } else {
      // Study session
      studentSocketService.emitStudySession(
        req.user._id.toString(),
        studentName,
        {
          subject,
          duration,
          progress: completionPercentage
        }
      );
    }

    res.json({ session: profile.studySessions[profile.studySessions.length - 1] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const startQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizTitle, subject, totalQuestions } = req.body;
    
    // Emit real-time quiz start event
    const studentName = `${req.user.firstName || 'Student'} ${req.user.lastName || ''}`.trim() || req.user.email?.split('@')[0] || 'Student';
    
    studentSocketService.emitQuizStart(
      req.user._id.toString(),
      studentName,
      {
        quizTitle,
        subject,
        totalQuestions
      }
    );

    res.json({ message: 'Quiz started successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const completeQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizTitle, score, totalQuestions, subject } = req.body;
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    // Add quiz session to profile
    const accuracy = Math.round((score / totalQuestions) * 100);
    profile.studySessions.push({
      subject,
      topic: quizTitle,
      duration: 0, // Quiz duration not tracked here
      completionPercentage: accuracy,
      quizScore: score,
      timestamp: new Date()
    });

    await profile.save();

    // Award XP for quiz completion
    const xp = gamificationService.calculateXPForActivity('quiz_complete', accuracy);
    await gamificationService.awardXP(req.user._id.toString(), xp, 'Quiz completed');

    // Emit real-time quiz completion event
    const studentName = `${req.user.firstName || 'Student'} ${req.user.lastName || ''}`.trim() || req.user.email?.split('@')[0] || 'Student';
    
    studentSocketService.emitQuizComplete(
      req.user._id.toString(),
      studentName,
      {
        quizTitle,
        score,
        totalQuestions,
        accuracy
      }
    );

    res.json({ message: 'Quiz completed successfully', accuracy });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const startLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonTitle, course, duration } = req.body;
    
    // Emit real-time lesson start event
    const studentName = `${req.user.firstName || 'Student'} ${req.user.lastName || ''}`.trim() || req.user.email?.split('@')[0] || 'Student';
    
    studentSocketService.emitLessonStart(
      req.user._id.toString(),
      studentName,
      {
        lessonTitle,
        course,
        duration
      }
    );

    res.json({ message: 'Lesson started successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudyTime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { minutes } = req.body;
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.totalStudyTime += minutes;
    await profile.save();

    // Emit real-time study time update
    const studentName = `${req.user.firstName || 'Student'} ${req.user.lastName || ''}`.trim() || req.user.email?.split('@')[0] || 'Student';
    
    studentSocketService.emitStudentActivity(
      req.user._id.toString(),
      studentName,
      {
        activity: `Studied for ${minutes} minutes`,
        activityType: 'study_session',
        data: { minutes }
      }
    );

    res.json({ message: 'Study time updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
