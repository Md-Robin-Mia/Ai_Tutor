import StudentProfile from '../models/StudentProfile.model';
import QuizAttempt from '../models/QuizAttempt.model';
import mongoose from 'mongoose';
// import Course from '../../models/Course.js'; // Commented out to avoid TypeScript errors

export class AnalyticsService {
  async getDashboardData(userId: string): Promise<any> {
    try {
      const profile = await StudentProfile.findOne({ userId });
      if (!profile) {
        // Return empty data for new users - no demo data
        return this.getEmptyDashboardData();
      }

      const recentSessions = profile.studySessions.slice(-10);
      const subjectProgress = this.calculateSubjectProgress(profile.studySessions);
      const weeklyActivity = this.getWeeklyActivity(profile.studySessions);
      
      // Calculate completed lessons across all courses
      const completedLessons = this.calculateTotalCompletedLessons(profile);
      console.log('Completed lessons calculated:', completedLessons);
      
      // Calculate quiz average percentage
      const quizAverage = await this.calculateQuizAverage(userId);
      
      // Calculate active days
      console.log('Profile study sessions count:', profile.studySessions?.length || 0);
      console.log('Profile totalStudyTime (minutes):', profile.totalStudyTime);
      const activeDays = this.calculateActiveDays(profile.studySessions);

      const totalStudyTimeHours = Math.round(profile.totalStudyTime / 60 * 10) / 10;
      console.log('Total study time in hours:', totalStudyTimeHours);

      return {
        totalStudyTime: totalStudyTimeHours,
        studyStreak: profile.studyStreak,
        xp: profile.xp,
        level: profile.currentLevel,
        badges: profile.badges.length,
        subjectProgress,
        weeklyActivity,
        recentSessions,
        weakAreas: profile.weakAreas,
        completedLessons,
        quizAverage,
        activeDays,
        currentStreak: profile.studyStreak,
        hasData: true // Flag to indicate real data exists
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return this.getEmptyDashboardData();
    }
  }

  async getCourseBasedAnalytics(userId: string): Promise<any> {
    try {
      const profile = await StudentProfile.findOne({ userId });
      if (!profile) {
        return this.getEmptyCourseAnalytics();
      }

    // Get actual courses from database
      const Course = mongoose.model('Course');
      const adminCourses = await Course.find({ 
        published: true, 
        approvedByAdmin: true 
      }).populate('category instructor');

      if (!adminCourses || adminCourses.length === 0) {
        return this.getEmptyCourseAnalytics();
      }

      // Get courses the user has progress for
      const userCourseIds = profile.courseProgress.map(progress => progress.courseId.toString());
      console.log('User course progress IDs:', userCourseIds);
      console.log('Total admin courses available:', adminCourses.length);
      
      // Calculate course performance ONLY for courses the user has progress for
      const coursePerformance = adminCourses
        .filter(course => {
          // Only include courses where the user has actual progress
          const hasProgress = userCourseIds.includes(course._id.toString());
          console.log(`Course "${course.title}" - Has progress: ${hasProgress}`);
          return hasProgress;
        })
        .map(course => {
          const courseProgress = profile.courseProgress.find(
            progress => progress.courseId.toString() === course._id.toString()
          );
          
          const courseSessions = profile.studySessions.filter(session => 
            session.courseId && session.courseId.toString() === course._id.toString()
          );
          
          const avgScore = courseSessions
            .filter(session => session.quizScore)
            .reduce((sum: number, session: any) => sum + session.quizScore, 0) / courseSessions.length || 0;

          const timeSpent = courseSessions.reduce((total, session) => 
            total + (session.duration || 0), 0
          );

          return {
            subject: course.title, // Use exact course title from Admin Dashboard
            score: Math.round(avgScore || 0), // Real score from user's sessions
            timeSpent: Math.round(timeSpent / 60 * 10) / 10, // Real time spent
            courseId: course._id,
            completion: Math.round(courseProgress?.completionPercentage || 0),
            totalLessons: course.totalLessons,
            completedLessons: courseProgress?.lessonsCompleted?.length || 0,
            category: course.category?.name || 'General',
            thumbnail: course.thumbnail || '',
            currentLesson: courseProgress?.currentLesson,
            currentModule: courseProgress?.currentModule,
            lastAccessed: courseProgress?.lastAccessed,
            level: course.level,
            instructor: course.instructor?.name || 'Unknown',
            enrolledAt: courseProgress?.enrolledAt,
            // Add admin course metadata
            isFromAdminDashboard: true,
            published: course.published,
            approvedByAdmin: course.approvedByAdmin,
            // Add progress status
            hasProgress: true,
            progressStatus: 'active'
          };
        });

      console.log('Final course performance list (only enrolled courses):', coursePerformance.length);
      coursePerformance.forEach(course => {
        console.log(`- ${course.subject} (${course.score}% score, ${course.timeSpent}h)`);
      });

      // Get weak topics from course performance (only from courses with progress)
      const coursesWithProgress = coursePerformance.filter(course => course.hasProgress);
      const weakTopics = this.getWeakTopicsFromCourses(coursesWithProgress, []);

      return {
        coursePerformance,
        weakTopics,
        totalEnrolledCourses: coursePerformance.length, // Only courses user has progress for
        averageCourseScore: coursesWithProgress.length > 0 
          ? Math.round(coursesWithProgress.reduce((sum, course) => sum + course.score, 0) / coursesWithProgress.length)
          : 0,
        // Add metadata
        source: 'enrolled-courses',
        onlyEnrolledCourses: true,
        totalAdminCourses: adminCourses.length,
        coursesWithProgress: coursesWithProgress.length,
        enrolledCoursesCount: coursePerformance.length
      };
    } catch (error) {
      console.error('Error in getCourseBasedAnalytics:', error);
      return this.getEmptyCourseAnalytics();
    }
  }

  private getWeakTopicsFromCourses(_coursePerformance: any[], _quizAttempts: any[]): any[] {
    const topicMap = new Map();
    
    // Analyze quiz attempts for weak areas
    _quizAttempts.forEach(attempt => {
      if (attempt.score < 70) { // Consider scores below 70% as weak
        attempt.topics?.forEach((topic: string) => {
          if (!topicMap.has(topic)) {
            topicMap.set(topic, { attempts: 0, totalScore: 0, successCount: 0 });
          }
          const data = topicMap.get(topic);
          data.attempts++;
          data.totalScore += attempt.score;
          if (attempt.score >= 60) data.successCount++;
        });
      }
    });

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        attempts: data.attempts,
        successRate: Math.round((data.successCount / data.attempts) * 100),
        avgScore: Math.round(data.totalScore / data.attempts)
      }))
      .filter(item => item.successRate < 70) // Only show topics with less than 70% success
      .sort((a, b) => a.successRate - b.successRate) // Sort by worst performance first
      .slice(0, 5); // Show top 5 weak topics
  }

  private calculateSubjectProgress(sessions: any[]): any[] {
    const subjectMap = new Map();
    
    sessions.forEach(session => {
      if (!subjectMap.has(session.subject)) {
        subjectMap.set(session.subject, { total: 0, completed: 0, avgScore: 0, scores: [] });
      }
      const data = subjectMap.get(session.subject);
      data.total++;
      if (session.completionPercentage >= 80) data.completed++;
      if (session.quizScore) data.scores.push(session.quizScore);
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length) : 0
    }));
  }

  private getWeeklyActivity(sessions: any[]): any[] {
    if (!sessions || sessions.length === 0) {
      // Return empty array for new users - no demo data
      return [];
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const dayMap = new Map();
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dayMap.set(dayKey, 0);
    }

    recentSessions.forEach(session => {
      const dayKey = new Date(session.timestamp).toISOString().split('T')[0];
      if (dayMap.has(dayKey)) {
        dayMap.set(dayKey, dayMap.get(dayKey) + session.duration);
      }
    });

    const weeklyData = Array.from(dayMap.entries()).map(([date, minutes]) => ({ date, minutes })).reverse();
    
    // Return only days with actual activity
    return weeklyData.filter(item => item.minutes > 0);
  }

  async generateReport(userId: string, type: 'weekly' | 'monthly'): Promise<any> {
    const profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email');
    if (!profile) {
      throw new Error('Profile not found');
    }

    const days = type === 'weekly' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentSessions = profile.studySessions.filter(s => new Date(s.timestamp) >= startDate);
    const quizAttempts = await QuizAttempt.find({ 
      studentId: userId, 
      completedAt: { $gte: startDate } 
    });

    const totalStudyTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgQuizScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum, q) => sum + q.percentage, 0) / quizAttempts.length 
      : 0;

    const strengths = this.identifyStrengths(recentSessions, quizAttempts);
    const weaknesses = profile.weakAreas.slice(0, 3);
    const recommendations = this.generateRecommendations(profile, recentSessions);

    return {
      period: type,
      studentName: (profile.userId as any).name,
      summary: {
        totalStudyTime,
        sessionsCompleted: recentSessions.length,
        quizzesTaken: quizAttempts.length,
        avgQuizScore: Math.round(avgQuizScore),
        studyStreak: profile.studyStreak
      },
      strengths,
      weaknesses,
      recommendations,
      generatedAt: new Date()
    };
  }

  private identifyStrengths(sessions: any[], quizzes: any[]): string[] {
    const strengths: string[] = [];
    
    const subjectScores = new Map();
    quizzes.forEach(q => {
      if (!subjectScores.has(q.subject)) subjectScores.set(q.subject, []);
      subjectScores.get(q.subject).push(q.percentage);
    });

    subjectScores.forEach((scores, subject) => {
      const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      if (avg >= 80) strengths.push(`Strong performance in ${subject}`);
    });

    if (sessions.length >= 5) strengths.push('Consistent study habits');
    
    return strengths;
  }

  async getRealTimeAnalytics(userId: string): Promise<any> {
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Profile not found');
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Recent activity (last 24 hours)
    const recentSessions = profile.studySessions.filter(s => new Date(s.timestamp) >= last24Hours);
    const recentQuizAttempts = await QuizAttempt.find({ 
      studentId: userId, 
      completedAt: { $gte: last24Hours } 
    });

    // Weekly progress
    const weeklySessions = profile.studySessions.filter(s => new Date(s.timestamp) >= lastWeek);
    const weeklyQuizAttempts = await QuizAttempt.find({ 
      studentId: userId, 
      completedAt: { $gte: lastWeek } 
    });

    // Calculate real-time metrics
    const currentStreak = this.calculateCurrentStreak(profile.studySessions);
    const weeklyProgress = this.getWeeklyProgressData(weeklySessions, weeklyQuizAttempts);
    const subjectPerformance = this.getRealTimeSubjectPerformance(weeklySessions);
    const learningTrends = this.calculateLearningTrends(profile, weeklySessions, weeklyQuizAttempts);
    const weakTopics = this.getUpdatedWeakTopics(profile.weakAreas, recentQuizAttempts);

    return {
      timestamp: now,
      currentStreak,
      weeklyProgress,
      subjectPerformance,
      learningTrends,
      weakTopics,
      recentActivity: {
        sessionsToday: recentSessions.length,
        quizzesToday: recentQuizAttempts.length,
        studyTimeToday: recentSessions.reduce((sum, s) => sum + s.duration, 0),
        avgAccuracyToday: recentQuizAttempts.length > 0 
          ? Math.round(recentQuizAttempts.reduce((sum, q) => sum + q.percentage, 0) / recentQuizAttempts.length)
          : 0
      },
      liveStats: {
        totalStudyTime: profile.totalStudyTime,
        currentLevel: profile.currentLevel,
        xp: profile.xp,
        badges: profile.badges.length
      }
    };
  }

  private calculateCurrentStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    let streak = 0;
    let expectedDate = new Date();
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp).toDateString();
      const expectedDateStr = expectedDate.toDateString();
      
      if (sessionDate === expectedDateStr || sessionDate === yesterday) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getWeeklyProgressData(sessions: any[], quizzes: any[]): any[] {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const recentQuizzes = quizzes.filter(q => new Date(q.completedAt) >= weekAgo);
    
    const dayMap = new Map();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dayMap.set(dayKey, { hours: 0, accuracy: 0, sessions: 0, quizzes: 0 });
    }

    recentSessions.forEach(session => {
      const dayKey = new Date(session.timestamp).toISOString().split('T')[0];
      if (dayMap.has(dayKey)) {
        const dayData = dayMap.get(dayKey);
        dayData.hours += session.duration / 60;
        dayData.sessions++;
        if (session.quizScore) {
          dayData.accuracy = (dayData.accuracy * dayData.quizzes + session.quizScore) / (dayData.quizzes + 1);
        }
      }
    });

    recentQuizzes.forEach(quiz => {
      const dayKey = new Date(quiz.completedAt).toISOString().split('T')[0];
      if (dayMap.has(dayKey)) {
        const dayData = dayMap.get(dayKey);
        dayData.quizzes++;
        dayData.accuracy = (dayData.accuracy * dayData.quizzes + quiz.percentage) / (dayData.quizzes + 1);
      }
    });

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      day: new Date(date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 3),
      hours: Math.round(data.hours * 10) / 10,
      accuracy: Math.round(data.accuracy)
    })).reverse();
  }

  private getRealTimeSubjectPerformance(sessions: any[]): any[] {
    const subjectMap = new Map();
    
    sessions.forEach(session => {
      if (!subjectMap.has(session.subject)) {
        subjectMap.set(session.subject, { total: 0, completed: 0, avgScore: 0, scores: [], timeSpent: 0 });
      }
      const data = subjectMap.get(session.subject);
      data.total++;
      data.timeSpent += session.duration || 0;
      if (session.completionPercentage >= 80) data.completed++;
      if (session.quizScore) data.scores.push(session.quizScore);
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      score: data.scores.length > 0 ? Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length) : 0,
      timeSpent: Math.round(data.timeSpent / 60 * 10) / 10,
      completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  }

  private calculateLearningTrends(_profile: any, sessions: any[], quizzes: any[]): any {
    const totalSessions = sessions.length;
    const avgAccuracy = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.percentage, 0) / quizzes.length) : 0;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    return {
      improvement: avgAccuracy > 0 ? Math.round((avgAccuracy - 75) * 0.5) : 10,
      consistency: Math.min(95, Math.max(60, totalSessions * 5)),
      totalHours: Math.round(totalTime / 60)
    };
  }

  private getUpdatedWeakAreas(_weakAreas: any[], recentQuizzes: any[]): any[] {
    const weakTopics = new Map();
    
    recentQuizzes.forEach(quiz => {
      if (quiz.score < 70) {
        quiz.topics?.forEach((topic: string) => {
          if (!weakTopics.has(topic)) {
            weakTopics.set(topic, { attempts: 0, lastAttempt: new Date(), score: 0 });
          }
          const data = weakTopics.get(topic);
          data.attempts++;
          data.lastAttempt = new Date(quiz.completedAt);
          data.score = Math.max(data.score, quiz.score);
        });
      }
    });

    return Array.from(weakTopics.entries())
      .map(([topic, data]) => ({
        topic,
        attempts: data.attempts,
        lastAttempted: data.lastAttempt,
        averageScore: data.score,
        needsRevision: data.attempts >= 3 && data.score < 60
      }))
      .sort((a, b) => b.lastAttempted.getTime() - a.lastAttempted.getTime())
      .slice(0, 5);
  }

  private getUpdatedWeakTopics(_weakAreas: any[], recentQuizzes: any[]): any[] {
    const weakTopics = new Map();
    
    recentQuizzes.forEach(quiz => {
      if (quiz.score < 70) {
        quiz.topics?.forEach((topic: string) => {
          if (!weakTopics.has(topic)) {
            weakTopics.set(topic, { attempts: 0, lastAttempt: new Date(), score: 0 });
          }
          const data = weakTopics.get(topic);
          data.attempts++;
          data.lastAttempt = new Date(quiz.completedAt);
          data.score = Math.max(data.score, quiz.score);
        });
      }
    });

    return Array.from(weakTopics.entries())
      .map(([topic, data]) => ({
        topic,
        attempts: data.attempts,
        lastAttempted: data.lastAttempted,
        averageScore: data.score,
        needsRevision: data.attempts >= 3 && data.score < 60
      }))
      .sort((a, b) => b.lastAttempted.getTime() - a.lastAttempted.getTime())
      .slice(0, 5);
  }

  private generateRecommendations(profile: any, sessions: any[]): string[] {
    const recommendations: string[] = [];
    
    if (profile.studyStreak < 3) {
      recommendations.push('Try to maintain a consistent study schedule');
    }
    
    if (sessions.length < 5) {
      recommendations.push('Increase your study frequency for better results');
    }
    
    const avgSessionTime = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
      : 0;
    
    if (avgSessionTime < 30) {
      recommendations.push('Consider longer study sessions for deeper learning');
    }
    
    return recommendations;
  }

  // Helper methods for calculating student-specific metrics
  private calculateTotalCompletedLessons(profile: any): number {
    const total = profile.courseProgress.reduce((total: number, course: any) => {
      const lessonCount = course.lessonsCompleted?.length || 0;
      console.log(`Course ${course.courseTitle}: ${lessonCount} completed lessons`);
      return total + lessonCount;
    }, 0);
    
    console.log(`Total completed lessons calculated: ${total}`);
    return total;
  }

  private async calculateQuizAverage(userId: string): Promise<number> {
    try {
      console.log('Calculating quiz average for user:', userId);
      
      const quizAttempts = await QuizAttempt.find({ studentId: userId });
      console.log('Found quiz attempts:', quizAttempts.length);
      
      if (quizAttempts.length === 0) {
        console.log('No quiz attempts found, returning 0');
        return 0;
      }
      
      const totalPercentage = quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
      const average = Math.round(totalPercentage / quizAttempts.length);
      
      console.log('Quiz attempts details:');
      quizAttempts.forEach((attempt, index) => {
        console.log(`  Attempt ${index + 1}: ${attempt.percentage}% (score: ${attempt.score}/${attempt.totalPoints})`);
      });
      console.log(`Calculated quiz average: ${average}%`);
      
      return average;
    } catch (error) {
      console.error('Error calculating quiz average:', error);
      return 0;
    }
  }

  private calculateActiveDays(studySessions: any[]): number {
    if (!studySessions || studySessions.length === 0) {
      console.log('No study sessions found for active days calculation');
      return 0;
    }
    
    console.log('Calculating active days from', studySessions.length, 'study sessions');
    
    const uniqueDays = new Set(
      studySessions.map(session => {
        const date = new Date(session.timestamp);
        const dateString = date.toDateString();
        console.log(`Session on ${dateString} (${date.toISOString()})`);
        return dateString;
      })
    );
    
    const activeDaysCount = uniqueDays.size;
    console.log('Unique study days found:', Array.from(uniqueDays));
    console.log('Active days calculated:', activeDaysCount);
    
    return activeDaysCount;
  }

  // Empty data methods for users without activity
  private getEmptyDashboardData(): any {
    return {
      totalStudyTime: 0,
      studyStreak: 0,
      xp: 0,
      level: 1,
      badges: 0,
      subjectProgress: [],
      weeklyActivity: [],
      recentSessions: [],
      weakAreas: [],
      completedLessons: 0,
      quizAverage: 0,
      activeDays: 0,
      currentStreak: 0,
      hasData: false // Flag to indicate no real data exists
    };
  }

  private getEmptyCourseAnalytics(): any {
    return {
      coursePerformance: [],
      weakTopics: [],
      totalEnrolledCourses: 0,
      averageCourseScore: 0,
      source: 'empty-data',
      onlyAdminCourses: false,
      totalAdminCourses: 0,
      coursesWithProgress: 0,
      hasData: false
    };
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
