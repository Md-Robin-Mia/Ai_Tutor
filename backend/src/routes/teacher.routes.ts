import express from 'express';
import { 
  getClassrooms, 
  createClassroom, 
  assignTask, 
  getClassAnalytics,
  getTeacherDashboard,
  createCourse,
  updateCourse,
  getTeacherCourseById,
  getTeacherCourses,
  getCategories,
  createCategory,
  getTeacherCategories,
  updateCategory,
  deleteCategory
} from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

// Configure multer for video and image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else {
      cb(null, 'uploads/videos/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos, thumbnails will be much smaller
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      // Accept image files for thumbnail
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for thumbnail'));
      }
    } else {
      // Accept video files for lessons
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for lessons'));
      }
    }
  }
});

// Teacher routes - fixed UserRole import
const router = express.Router();

router.get('/dashboard', authenticate, authorize('teacher'), getTeacherDashboard);
router.get('/classrooms', authenticate, authorize('teacher'), getClassrooms);
router.post('/classrooms', authenticate, authorize('teacher'), createClassroom);
router.post('/assign', authenticate, authorize('teacher'), assignTask);
router.get('/analytics/:classroomId', authenticate, authorize('teacher'), getClassAnalytics);

// Course management routes
router.post('/courses', authenticate, authorize('teacher'), upload.any(), createCourse);
router.get('/courses', authenticate, authorize('teacher'), getTeacherCourses);
router.get('/courses/:courseId', authenticate, authorize('teacher'), getTeacherCourseById);
router.put('/courses/:courseId', authenticate, authorize('teacher'), upload.any(), updateCourse);
router.patch('/courses/:courseId/publish', authenticate, authorize('teacher'), updateCourse);

// Category management routes
router.get('/categories', authenticate, authorize('teacher'), getCategories);
router.post('/categories', authenticate, authorize('teacher'), createCategory);
router.get('/categories/my', authenticate, authorize('teacher'), getTeacherCategories);
router.put('/categories/:id', authenticate, authorize('teacher'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('teacher'), deleteCategory);

export default router;
