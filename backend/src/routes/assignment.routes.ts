import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';
import {
  createAssignment,
  getTeacherAssignments,
  submitAssignment,
  getStudentAssignments,
  getAssignmentAnalytics,
  generateDailyQuizzes
} from '../controllers/assignment.controller';

const router = Router();

// Teacher routes
router.post('/', authenticate, authorize(UserRole.TEACHER), createAssignment);
router.get('/teacher', authenticate, authorize(UserRole.TEACHER), getTeacherAssignments);
router.get('/analytics', authenticate, authorize(UserRole.TEACHER), getAssignmentAnalytics);

// Student routes
router.get('/student', authenticate, authorize(UserRole.STUDENT), getStudentAssignments);
router.post('/:assignmentId/submit', authenticate, authorize(UserRole.STUDENT), submitAssignment);

// Admin route for generating daily quizzes (can be called by cron job)
router.post('/generate-daily', authenticate, authorize(UserRole.ADMIN), generateDailyQuizzes);

export default router;
