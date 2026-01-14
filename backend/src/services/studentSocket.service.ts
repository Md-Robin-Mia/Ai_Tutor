import { io } from '../server';

export interface StudentActivityData {
  activity: string;
  activityType: 'login' | 'logout' | 'quiz_start' | 'quiz_complete' | 'lesson_start' | 'lesson_complete' | 'study_session';
  data?: any;
}

export interface QuizStartData {
  quizTitle: string;
  subject: string;
  totalQuestions?: number;
}

export interface QuizCompleteData {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
}

export interface LessonStartData {
  lessonTitle: string;
  course: string;
  duration?: number;
}

export interface LessonCompleteData {
  lessonTitle: string;
  course: string;
  progress: number;
  timeSpent: number;
}

export interface StudySessionData {
  subject: string;
  duration: number;
  progress: number;
}

class StudentSocketService {
  /**
   * Emit student activity to teachers' dashboard
   */
  emitStudentActivity(studentId: string, studentName: string, activityData: StudentActivityData): void {
    try {
      io.to('teacher_dashboard').emit('real_time_update', {
        type: 'student_activity',
        payload: {
          studentId,
          name: studentName,
          activity: activityData.activity,
          timestamp: new Date().toISOString(),
          activityType: activityData.activityType,
          data: activityData.data
        }
      });
    } catch (error) {
      console.error('Error emitting student activity:', error);
    }
  }

  /**
   * Emit quiz start event
   */
  emitQuizStart(studentId: string, studentName: string, data: QuizStartData): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: `Started quiz: ${data.quizTitle}`,
      activityType: 'quiz_start',
      data
    });
  }

  /**
   * Emit quiz completion event
   */
  emitQuizComplete(studentId: string, studentName: string, data: QuizCompleteData): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: `Completed quiz: ${data.quizTitle} (${data.score}/${data.totalQuestions})`,
      activityType: 'quiz_complete',
      data
    });

    // Also emit performance update
    this.emitPerformanceUpdate(studentId, studentName, {
      progress: undefined, // Will be calculated from overall progress
      accuracy: data.accuracy
    });
  }

  /**
   * Emit lesson start event
   */
  emitLessonStart(studentId: string, studentName: string, data: LessonStartData): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: `Started lesson: ${data.lessonTitle}`,
      activityType: 'lesson_start',
      data
    });
  }

  /**
   * Emit lesson completion event
   */
  emitLessonComplete(studentId: string, studentName: string, data: LessonCompleteData): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: `Completed lesson: ${data.lessonTitle}`,
      activityType: 'lesson_complete',
      data
    });

    // Also emit performance update
    this.emitPerformanceUpdate(studentId, studentName, {
      progress: data.progress,
      accuracy: undefined // Will keep current accuracy
    });
  }

  /**
   * Emit study session event
   */
  emitStudySession(studentId: string, studentName: string, data: StudySessionData): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: `Studying ${data.subject}`,
      activityType: 'study_session',
      data
    });
  }

  /**
   * Emit performance update
   */
  emitPerformanceUpdate(studentId: string, studentName: string, data: {
    progress?: number;
    accuracy?: number;
  }): void {
    try {
      io.to('teacher_dashboard').emit('real_time_update', {
        type: 'performance_update',
        payload: {
          studentName,
          progress: data.progress,
          accuracy: data.accuracy
        }
      });
    } catch (error) {
      console.error('Error emitting performance update:', error);
    }
  }

  /**
   * Emit login event
   */
  emitLogin(studentId: string, studentName: string): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: 'Logged in',
      activityType: 'login'
    });
  }

  /**
   * Emit logout event
   */
  emitLogout(studentId: string, studentName: string): void {
    this.emitStudentActivity(studentId, studentName, {
      activity: 'Logged out',
      activityType: 'logout'
    });
  }

  /**
   * Emit class statistics update
   */
  emitClassStatsUpdate(data: {
    onlineNow: number;
    totalStudyTimeToday: number;
    quizzesCompletedToday: number;
  }): void {
    try {
      io.to('teacher_dashboard').emit('real_time_update', {
        type: 'class_stats_update',
        payload: data
      });
    } catch (error) {
      console.error('Error emitting class stats update:', error);
    }
  }
}

export const studentSocketService = new StudentSocketService();
