import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

class StudentSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      console.warn('No authentication token available for socket connection');
      return;
    }

    console.log('Connecting student socket to: http://localhost:3003');
    
    this.socket = io('http://localhost:3003', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Student socket connected successfully');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Student socket disconnected');
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Student socket connection error:', error);
      console.log('Connection details:', {
        url: 'http://localhost:3003',
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitQuizStart(data: { quizTitle: string; subject: string; totalQuestions?: number }) {
    if (this.socket?.connected) {
      this.socket.emit('quiz_start', data);
    }
  }

  emitQuizComplete(data: { quizTitle: string; score: number; totalQuestions: number; subject: string }) {
    if (this.socket?.connected) {
      this.socket.emit('quiz_complete', data);
    }
  }

  emitLessonStart(data: { lessonTitle: string; course: string; duration?: number }) {
    if (this.socket?.connected) {
      this.socket.emit('lesson_start', data);
    }
  }

  emitLessonComplete(data: { lessonTitle: string; course: string; progress: number; timeSpent: number }) {
    if (this.socket?.connected) {
      this.socket.emit('lesson_complete', data);
    }
  }

  emitStudentActivity(data: { activity: string; activityType: string; data?: any }) {
    if (this.socket?.connected) {
      this.socket.emit('student_activity', data);
    }
  }

  emitStudyTimeUpdate(data: { minutes: number }) {
    if (this.socket?.connected) {
      this.socket.emit('update_study_time', data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const studentSocketService = new StudentSocketService();
