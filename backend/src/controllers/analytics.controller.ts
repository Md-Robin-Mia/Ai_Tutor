import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import analyticsService from '../services/analytics.service';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const data = await analyticsService.getDashboardData(req.user._id.toString());
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReport = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { type } = req.params;
    if (type !== 'weekly' && type !== 'monthly') {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    
    const report = await analyticsService.generateReport(req.user._id.toString(), type);
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRealTimeData = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user._id.toString();
    
    // Get real-time dashboard data
    const dashboardData = await analyticsService.getDashboardData(userId);
    
    // Get course-based analytics with real Admin Dashboard course data
    const courseAnalytics = await analyticsService.getCourseBasedAnalytics(userId);
    
    // Transform course data to match expected format
    const subjectPerformance = courseAnalytics.coursePerformance.map(course => ({
      subject: course.subject,
      score: course.score,
      timeSpent: course.timeSpent,
      courseId: course.courseId,
      category: course.category,
      completion: course.completion,
      thumbnail: course.thumbnail,
      level: course.level,
      instructor: course.instructor,
      totalLessons: course.totalLessons,
      completedLessons: course.completedLessons,
      currentLesson: course.currentLesson,
      currentModule: course.currentModule,
      lastAccessed: course.lastAccessed,
      enrolledAt: course.enrolledAt
    }));

    // Get real weekly activity from dashboard data
    const weeklyProgress = dashboardData.weeklyActivity?.map((activity: any) => {
      const date = new Date(activity.date);
      const dayName = date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3);
      return {
        day: dayName,
        hours: Math.round(activity.minutes / 60 * 10) / 10
      };
    }) || []; // No demo data - empty array if no real data
    
    // Calculate learning trends based on real course data
    const learningTrends = {
      improvement: courseAnalytics.averageCourseScore > 0 ? Math.round((courseAnalytics.averageCourseScore - 70) * 0.5) : 0,
      consistency: courseAnalytics.averageCourseScore > 0 ? Math.min(95, Math.max(60, courseAnalytics.averageCourseScore + 10)) : 0,
      totalHours: Math.round(subjectPerformance.reduce((sum, subject) => sum + (subject.timeSpent || 0), 0))
    };

    // Transform weak topics
    const weakTopics = courseAnalytics.weakTopics.map(topic => ({
      topic: topic.topic,
      attempts: topic.attempts,
      successRate: topic.successRate
    }));

    // Recent activity based on real data
    const recentActivity = {
      sessionsToday: dashboardData.recentSessions?.filter((session: any) => {
        const today = new Date().toDateString();
        return new Date(session.timestamp).toDateString() === today;
      }).length || 0,
      quizzesToday: 0, // Real data only - no default values
      studyTimeToday: dashboardData.recentSessions?.filter((session: any) => {
        const today = new Date().toDateString();
        return new Date(session.timestamp).toDateString() === today;
      }).reduce((total: number, session: any) => total + session.duration, 0) || 0,
      avgAccuracyToday: courseAnalytics.averageCourseScore || dashboardData.quizAverage || 0
    };

    const data = {
      // Real-time data from dashboard
      ...dashboardData,
      // Additional real-time analytics
      weeklyProgress,
      subjectPerformance,
      learningTrends,
      weakTopics,
      recentActivity,
      timestamp: new Date().toISOString(),
      // Ensure all required fields are present
      totalStudyTime: dashboardData.totalStudyTime || learningTrends.totalHours,
      currentLevel: dashboardData.level || dashboardData.currentLevel || 1,
      xp: dashboardData.xp || 0,
      badges: dashboardData.badges || 0,
      currentStreak: dashboardData.currentStreak || dashboardData.studyStreak || 0
    };

    return res.json(data);
  } catch (error: any) {
    console.error('Error in getRealTimeData:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getWeakAreas = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const data = await analyticsService.getDashboardData(req.user._id.toString());
    return res.json({ weakAreas: data.weakAreas });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
