import express from 'express';
import { 
  startStudySession, 
  completeStudySession, 
  trackQuizAttempt, 
  trackLessonCompletion, 
  getActiveSessions 
} from '../controllers/realtime-tracking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Study session tracking
router.post('/session/start', authenticate, startStudySession);
router.post('/session/complete', authenticate, completeStudySession);

// Quiz tracking
router.post('/quiz/attempt', authenticate, trackQuizAttempt);

// Lesson completion tracking
router.post('/lesson/complete', authenticate, trackLessonCompletion);

// Admin monitoring
router.get('/sessions/active', authenticate, getActiveSessions);

export default router;
