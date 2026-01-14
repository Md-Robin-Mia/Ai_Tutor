import StudentProfile from '../models/StudentProfile.model';
import QuizAttempt from '../models/QuizAttempt.model';
import mongoose from 'mongoose';

export class RealTimeTrackingService {
  private static instance: RealTimeTrackingService;
  private activeSessions: Map<string, any> = new Map();

  static getInstance(): RealTimeTrackingService {
    if (!RealTimeTrackingService.instance) {
      RealTimeTrackingService.instance = new RealTimeTrackingService();
    }
    return RealTimeTrackingService.instance;
  }

  // Track when a student starts a study session
  async startStudySession(userId: string, sessionData: {
    subject: string;
    topic: string;
    courseId?: string;
    lessonId?: string;
    moduleId?: string;
  }): Promise<void> {
    try {
      const sessionId = `${userId}-${Date.now()}`;
      this.activeSessions.set(sessionId, {
        userId,
        startTime: new Date(),
        ...sessionData
      });

      // Update student profile with new session
      await StudentProfile.findOneAndUpdate(
        { userId },
        {
          $push: {
            studySessions: {
              subject: sessionData.subject,
              topic: sessionData.topic,
              duration: 0, // Will be updated when session ends
              completionPercentage: 0,
              timestamp: new Date(),
              courseId: sessionData.courseId,
              lessonId: sessionData.lessonId,
              moduleId: sessionData.moduleId
            }
          },
          $set: {
            lastStudyDate: new Date(),
            studyStreak: this.calculateStudyStreak(userId)
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error starting study session:', error);
    }
  }

  // Track when a student completes a study session
  async completeStudySession(userId: string, sessionData: {
    subject: string;
    topic: string;
    duration: number;
    completionPercentage: number;
    quizScore?: number;
    courseId?: string;
    lessonId?: string;
    moduleId?: string;
  }): Promise<void> {
    try {
      console.log('Completing study session for user:', userId, 'Data:', sessionData);
      
      // Update the most recent session for this user
      const profile = await StudentProfile.findOne({ userId });
      if (profile) {
        const latestSession = profile.studySessions[profile.studySessions.length - 1];
        
        if (latestSession && 
            latestSession.subject === sessionData.subject &&
            latestSession.topic === sessionData.topic &&
            latestSession.duration === 0) {
          
          // Update the existing session
          latestSession.duration = sessionData.duration;
          latestSession.completionPercentage = sessionData.completionPercentage;
          if (sessionData.quizScore) {
            latestSession.quizScore = sessionData.quizScore;
          }
          console.log('Updated existing session:', latestSession);
        } else {
          // Add new session
          profile.studySessions.push({
            subject: sessionData.subject,
            topic: sessionData.topic,
            duration: sessionData.duration,
            completionPercentage: sessionData.completionPercentage,
            quizScore: sessionData.quizScore,
            timestamp: new Date(),
            courseId: sessionData.courseId,
            lessonId: sessionData.lessonId,
            moduleId: sessionData.moduleId
          });
          console.log('Added new session to profile');
        }

        // Update total study time
        const oldTotalTime = profile.totalStudyTime;
        profile.totalStudyTime += sessionData.duration;
        console.log(`Updated total study time: ${oldTotalTime} -> ${profile.totalStudyTime} (+${sessionData.duration} minutes)`);
        
        // Update XP based on activity
        const xpGained = Math.round(sessionData.duration / 10) + Math.round(sessionData.completionPercentage / 10);
        profile.xp += xpGained;
        
        // Update level based on XP
        profile.currentLevel = Math.floor(profile.xp / 500) + 1;

        await profile.save();
        console.log('Profile saved successfully with new study time:', profile.totalStudyTime);
      } else {
        console.log('No profile found for user:', userId);
      }

      // Remove from active sessions
      const sessionToRemove = Array.from(this.activeSessions.entries())
        .find(([key, session]) => 
          session.userId === userId && 
          session.subject === sessionData.subject &&
          session.topic === sessionData.topic
        );
      
      if (sessionToRemove) {
        this.activeSessions.delete(sessionToRemove[0]);
      }
    } catch (error) {
      console.error('Error completing study session:', error);
    }
  }

  // Track quiz attempts in real-time
  async trackQuizAttempt(userId: string, quizData: {
    quizId: string;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    subject?: string;
  }): Promise<void> {
    try {
      console.log('Tracking quiz attempt for user:', userId, 'Data:', quizData);
      
      // Create quiz attempt record
      const quizAttempt = await QuizAttempt.create({
        quizId: new mongoose.Types.ObjectId(quizData.quizId),
        studentId: new mongoose.Types.ObjectId(userId),
        score: quizData.score,
        totalPoints: quizData.totalPoints,
        percentage: quizData.percentage,
        passed: quizData.passed,
        timeSpent: quizData.timeSpent,
        completedAt: new Date()
      });
      
      console.log('Quiz attempt created:', quizAttempt._id);

      // Update student profile
      const profile = await StudentProfile.findOne({ userId });
      if (profile) {
        // Add XP for quiz completion
        const quizXp = quizData.passed ? 50 : 25;
        const oldXP = profile.xp;
        profile.xp += quizXp;
        
        // Update level
        profile.currentLevel = Math.floor(profile.xp / 500) + 1;
        
        console.log(`XP updated: ${oldXP} -> ${profile.xp} (+${quizXp} XP)`);

        // Update weak areas if score is low
        if (quizData.percentage < 70 && quizData.subject) {
          const existingWeakArea = profile.weakAreas.find(
            area => area.subject === quizData.subject
          );
          
          if (existingWeakArea) {
            existingWeakArea.mistakeCount++;
            existingWeakArea.lastPracticed = new Date();
            existingWeakArea.needsRevision = true;
          } else {
            profile.weakAreas.push({
              topic: 'Quiz Performance',
              subject: quizData.subject,
              mistakeCount: 1,
              lastPracticed: new Date(),
              needsRevision: true
            });
          }
        }

        await profile.save();
        console.log('Profile saved successfully with quiz attempt');
      } else {
        console.log('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error tracking quiz attempt:', error);
    }
  }

  // Track lesson completion
  async trackLessonCompletion(userId: string, lessonData: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
  }): Promise<void> {
    try {
      console.log('Tracking lesson completion for user:', userId, 'Data:', lessonData);
      
      const profile = await StudentProfile.findOne({ userId });
      if (profile) {
        // Find course progress
        let courseProgress = profile.courseProgress.find(
          progress => progress.courseId.toString() === lessonData.courseId
        );

        if (!courseProgress) {
          // Create new course progress entry
          courseProgress = {
            courseId: new mongoose.Types.ObjectId(lessonData.courseId),
            courseTitle: lessonData.lessonTitle,
            enrolledAt: new Date(),
            lastAccessed: new Date(),
            lessonsCompleted: [],
            totalLessons: 0,
            completionPercentage: 0,
            timeSpent: 0,
            averageScore: 0,
            currentLesson: lessonData.lessonId,
            progress: new Map()
          };
          profile.courseProgress.push(courseProgress);
          console.log('Created new course progress entry');
        }

        // Add lesson to completed lessons if not already there
        if (!courseProgress.lessonsCompleted.includes(lessonData.lessonId)) {
          const oldCount = courseProgress.lessonsCompleted.length;
          courseProgress.lessonsCompleted.push(lessonData.lessonId);
          courseProgress.lastAccessed = new Date();
          
          console.log(`Lesson completed: ${oldCount} -> ${courseProgress.lessonsCompleted.length} lessons`);
          
          // Update completion percentage
          if (courseProgress.totalLessons > 0) {
            courseProgress.completionPercentage = 
              (courseProgress.lessonsCompleted.length / courseProgress.totalLessons) * 100;
          }

          // Add XP for lesson completion
          const oldXP = profile.xp;
          profile.xp += 30;
          profile.currentLevel = Math.floor(profile.xp / 500) + 1;
          
          console.log(`XP updated: ${oldXP} -> ${profile.xp} (+30 XP)`);

          await profile.save();
          console.log('Profile saved successfully with new lesson completion');
        } else {
          console.log('Lesson already completed:', lessonData.lessonId);
        }
      } else {
        console.log('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error tracking lesson completion:', error);
    }
  }

  // Get active sessions for monitoring
  getActiveSessions(): any[] {
    return Array.from(this.activeSessions.values());
  }

  // Calculate study streak
  private async calculateStudyStreak(userId: string): Promise<number> {
    try {
      const profile = await StudentProfile.findOne({ userId });
      if (!profile || !profile.studySessions.length) return 0;

      const sessions = profile.studySessions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const session of sessions) {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating study streak:', error);
      return 0;
    }
  }
}

export const realTimeTrackingService = RealTimeTrackingService.getInstance();
