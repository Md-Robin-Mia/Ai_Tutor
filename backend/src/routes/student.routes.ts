import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  addGoal, 
  updateGoal, 
  recordSession, 
  startQuiz, 
  completeQuiz, 
  startLesson, 
  updateStudyTime 
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.get('/profile', authenticate, authorize(UserRole.STUDENT), getProfile);
router.put('/profile', authenticate, authorize(UserRole.STUDENT), updateProfile);
router.post('/goals', authenticate, authorize(UserRole.STUDENT), addGoal);
router.put('/goals/:goalId', authenticate, authorize(UserRole.STUDENT), updateGoal);
router.post('/sessions', authenticate, authorize(UserRole.STUDENT), recordSession);

// Real-time activity endpoints
router.post('/quiz/start', authenticate, authorize(UserRole.STUDENT), startQuiz);
router.post('/quiz/complete', authenticate, authorize(UserRole.STUDENT), completeQuiz);
router.post('/lesson/start', authenticate, authorize(UserRole.STUDENT), startLesson);
router.post('/study-time/update', authenticate, authorize(UserRole.STUDENT), updateStudyTime);

export default router;
