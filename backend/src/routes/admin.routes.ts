import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getAllStudents,
  getAllTeachers,
  getAllAdmins,
  blockStudent,
  unblockStudent,
  blockTeacher,
  unblockTeacher,
  deleteUser,
  getAllCourses,
  approveCourse,
  featureCourse,
  createAdmin,
  blockAdmin,
  unblockAdmin,
  deleteAdmin,
  getSystemAnalytics,
  getAdminPlanStudents
} from '../controllers/admin.controller';

console.log('🔧 Admin routes file loading...');

const router = Router();

console.log('🔧 Admin router created');

// Test endpoint without auth for debugging
router.get('/test', (req, res) => {
  console.log('🎯 Admin test route hit!');
  res.json({ message: 'Admin routes are working!', timestamp: new Date() });
});

console.log('🔧 Test route added');

// Apply authentication middleware to all admin routes
router.use(authenticate);
router.use(requireAdmin);

console.log('🔧 Auth middleware added');

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Students management
router.get('/students', getAllStudents);
router.put('/students/:studentId/block', blockStudent);
router.put('/students/:studentId/unblock', unblockStudent);

// Teachers management  
router.get('/teachers', getAllTeachers);
router.put('/teachers/:teacherId/block', blockTeacher);
router.put('/teachers/:teacherId/unblock', unblockTeacher);

// Admins management
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:adminId/block', blockAdmin);
router.put('/admins/:adminId/unblock', unblockAdmin);
router.delete('/admins/:adminId', deleteAdmin);

// Courses management
router.get('/courses', getAllCourses);
router.put('/courses/:courseId/approve', approveCourse);
router.put('/courses/:courseId/feature', featureCourse);

// User deletion (generic)
router.delete('/students/:userId', deleteUser);
router.delete('/teachers/:userId', deleteUser);

// Analytics
router.get('/analytics', getSystemAnalytics);
router.get('/plan/students', getAdminPlanStudents);

export default router;
