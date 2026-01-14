import { useAuthStore } from '../store/authStore';

class RealTimeTracking {
  private static instance: RealTimeTracking;
  private currentSession: any = null;
  private sessionStartTime: Date | null = null;

  static getInstance(): RealTimeTracking {
    if (!RealTimeTracking.instance) {
      RealTimeTracking.instance = new RealTimeTracking();
    }
    return RealTimeTracking.instance;
  }

  // Start tracking a study session
  async startStudySession(sessionData: {
    subject: string;
    topic: string;
    courseId?: string;
    lessonId?: string;
    moduleId?: string;
  }) {
    try {
      const { token } = useAuthStore.getState();
      if (!token) return;

      this.currentSession = sessionData;
      this.sessionStartTime = new Date();

      const response = await fetch('/api/tracking/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        console.log('Study session started:', sessionData);
      }
    } catch (error) {
      console.error('Error starting study session:', error);
    }
  }

  // Complete the current study session
  async completeStudySession(additionalData: {
    completionPercentage: number;
    quizScore?: number;
  } = { completionPercentage: 100 }) {
    try {
      const { token } = useAuthStore.getState();
      if (!token || !this.currentSession || !this.sessionStartTime) {
        console.log('Cannot complete session - missing token, currentSession, or startTime');
        console.log('Token:', !!token, 'Current Session:', !!this.currentSession, 'Start Time:', !!this.sessionStartTime);
        return;
      }

      const duration = Math.round((new Date().getTime() - this.sessionStartTime.getTime()) / 1000 / 60); // Duration in minutes

      const sessionData = {
        ...this.currentSession,
        duration,
        completionPercentage: additionalData.completionPercentage,
        quizScore: additionalData.quizScore
      };

      console.log('Sending session completion data:', sessionData);

      const response = await fetch('/api/tracking/session/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        console.log('Study session completed successfully:', sessionData);
      } else {
        console.error('Failed to complete session:', response.status, response.statusText);
      }

      // Reset session
      this.currentSession = null;
      this.sessionStartTime = null;
    } catch (error) {
      console.error('Error completing study session:', error);
    }
  }

  // Track quiz attempt
  async trackQuizAttempt(quizData: {
    quizId: string;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    subject?: string;
  }) {
    try {
      const { token } = useAuthStore.getState();
      if (!token) return;

      const response = await fetch('/api/tracking/quiz/attempt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        console.log('Quiz attempt tracked:', quizData);
      }
    } catch (error) {
      console.error('Error tracking quiz attempt:', error);
    }
  }

  // Track lesson completion
  async trackLessonCompletion(lessonData: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
  }) {
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        console.log('Cannot track lesson completion - no token');
        return;
      }

      console.log('Sending lesson completion data:', lessonData);

      const response = await fetch('/api/tracking/lesson/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });

      if (response.ok) {
        console.log('Lesson completion tracked successfully:', lessonData);
      } else {
        console.error('Failed to track lesson completion:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error tracking lesson completion:', error);
    }
  }

  // Auto-complete session when user leaves page
  handlePageUnload() {
    if (this.currentSession && this.sessionStartTime) {
      // Complete session with current progress
      this.completeStudySession({ completionPercentage: 50 }); // Assume 50% completion if user leaves
    }
  }

  // Get current session info
  getCurrentSession() {
    return {
      session: this.currentSession,
      startTime: this.sessionStartTime,
      duration: this.sessionStartTime ? Math.round((new Date().getTime() - this.sessionStartTime.getTime()) / 1000 / 60) : 0
    };
  }
}

// Create global instance
const realTimeTracking = RealTimeTracking.getInstance();

// Add page unload listener
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realTimeTracking.handlePageUnload();
  });
}

export default realTimeTracking;
