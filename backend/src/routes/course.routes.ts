import express from 'express';
import { 
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getStudentEnrolledCourses,
  getStudentInProgressCourses,
  getStudentCompletedCourses,
  updateCourseProgress
} from '../controllers/course.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Public routes (with optional authentication for teacher-specific features)
router.get('/', optionalAuthenticate, getAllCourses);
router.get('/:courseId', optionalAuthenticate, getCourseById);
router.get('/by-id/:courseId', optionalAuthenticate, getCourseById);

// Student routes (require authentication)
router.post('/:courseId/enroll', authenticate, authorize('student'), enrollInCourse);
router.post('/:courseId/progress', authenticate, authorize('student'), updateCourseProgress);
router.get('/student/enrolled', authenticate, authorize('student'), getStudentEnrolledCourses);
router.get('/student/in-progress', authenticate, authorize('student'), getStudentInProgressCourses);
router.get('/student/completed', authenticate, authorize('student'), getStudentCompletedCourses);

export default router;
