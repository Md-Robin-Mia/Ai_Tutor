import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Course from '../models/Course.model';
import StudentProfile from '../models/StudentProfile.model';
import User from '../models/User.model';
import mongoose from 'mongoose';

export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    console.log('getAllCourses called with query:', req.query);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty courses array');
      return res.json({ 
        courses: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        }
      });
    }
    
    const { page = 1, limit = 12, category, level, search, sortBy = 'createdAt' } = req.query;
    
    // Build query - show published courses for everyone, but show teacher's own courses (including drafts) to teachers
    let query: any;
    
    if (req.user && req.user.role === 'teacher') {
      // For teachers: show all published courses + their own courses (including drafts)
      query = {
        $or: [
          { published: true, approvedByAdmin: true },
          { instructor: req.user._id }
        ]
      };
    } else {
      // For students and public: only show published and approved courses
      query = {
        published: true,
        approvedByAdmin: true
      };
    }

    if (category && category !== 'all') {
      query['category.name'] = category;
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Build sort options
    let sort: any = {};
    switch (sortBy) {
      case 'popular':
        sort = { enrolledCount: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(query);

    // Add isEnrolled status for students
    let coursesWithEnrollmentStatus: any = courses;
    if (req.user && req.user.role === 'student') {
      console.log('Processing enrollment status for student:', req.user._id);
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        console.log('Student profile found with courseProgress:', studentProfile.courseProgress.length);
        coursesWithEnrollmentStatus = courses.map(course => {
          const courseProgress = studentProfile.courseProgress.find(
            (progress: any) => progress.courseId.toString() === course._id.toString()
          );
          const isEnrolled = !!courseProgress;
          const progress = courseProgress?.completionPercentage || 0;
          console.log(`Course ${course._id} - isEnrolled: ${isEnrolled}, progress: ${progress}`);
          
          // Convert to plain object and add enrollment fields
          const courseObj = course.toObject();
          return {
            ...courseObj,
            isEnrolled,
            progress
          };
        });
      } else {
        console.log('No student profile found for user:', req.user._id);
      }
    }

    console.log('Found courses:', courses.length);
    console.log('Courses data:', coursesWithEnrollmentStatus);

    res.json({
      courses: coursesWithEnrollmentStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot get course by ID');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }
    
    // Build query - show published courses for everyone, but show teacher's own courses to teachers
    let query: any;
    
    if (req.user && req.user.role === 'teacher') {
      // For teachers: show course if it's published/approved OR if they own it
      query = {
        $or: [
          { _id: req.params.courseId, published: true, approvedByAdmin: true },
          { _id: req.params.courseId, instructor: req.user._id }
        ]
      };
    } else {
      // For students and public: only show published and approved courses
      query = {
        _id: req.params.courseId,
        published: true,
        approvedByAdmin: true
      };
    }
    
    const course = await Course.findOne(query).populate('instructor', 'name email');

    if (!course) {
      // Determine the specific reason for course not being accessible
      const courseExists = await Course.findById(req.params.courseId);
      
      if (!courseExists) {
        res.status(404).json({ 
          message: 'Course not found',
          errorType: 'COURSE_NOT_EXIST',
          details: 'The course ID may be invalid or the course was never created'
        });
      } else if (!courseExists.published) {
        res.status(403).json({ 
          message: 'Course not published',
          errorType: 'COURSE_NOT_PUBLISHED',
          details: 'This course is still in draft mode and not available to students'
        });
      } else if (!courseExists.approvedByAdmin) {
        res.status(403).json({ 
          message: 'Course not approved',
          errorType: 'COURSE_NOT_APPROVED',
          details: 'This course is pending admin approval and not available to students'
        });
      } else {
        res.status(403).json({ 
          message: 'Access denied',
          errorType: 'PERMISSION_DENIED',
          details: 'You don\'t have permission to view this course. This may be a private course or requires enrollment'
        });
      }
      return;
    }

    // Check if student is enrolled
    let isEnrolled = false;
    let progress = 0;
    
    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      if (studentProfile) {
        const courseProgress = studentProfile.courseProgress.find(
          (progress: any) => progress.courseId.toString() === course._id.toString()
        );
        if (courseProgress) {
          isEnrolled = true;
          progress = courseProgress.completionPercentage || 0;
        }
      }
    }

    res.json({
      ...course.toObject(),
      isEnrolled,
      progress
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot enroll in course');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }
    
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      published: true,
      approvedByAdmin: true
    });

    if (!course) {
      // Determine the specific reason for course not being available for enrollment
      const courseExists = await Course.findById(courseId);
      
      if (!courseExists) {
        res.status(404).json({ 
          message: 'Course not found',
          errorType: 'COURSE_NOT_EXIST',
          details: 'The course ID may be invalid or the course was never created'
        });
      } else if (!courseExists.published) {
        res.status(403).json({ 
          message: 'Course not available for enrollment',
          errorType: 'COURSE_NOT_PUBLISHED',
          details: 'This course is still in draft mode and not available for enrollment'
        });
      } else if (!courseExists.approvedByAdmin) {
        res.status(403).json({ 
          message: 'Course not available for enrollment',
          errorType: 'COURSE_NOT_APPROVED',
          details: 'This course is pending admin approval and not available for enrollment'
        });
      } else {
        res.status(403).json({ 
          message: 'Cannot enroll in course',
          errorType: 'ENROLLMENT_DENIED',
          details: 'You are not eligible to enroll in this course'
        });
      }
      return;
    }

    // Get or create student profile
    let studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      studentProfile = new StudentProfile({
        userId: studentId,
        courseProgress: [],
        studySessions: [],
        goals: [],
        weakAreas: []
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = studentProfile.courseProgress.find(
      (progress: any) => progress.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    // Add to course progress
    studentProfile.courseProgress.push({
      courseId: new mongoose.Types.ObjectId(courseId),
      courseTitle: course.title,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      lessonsCompleted: [],
      totalLessons: course.totalLessons,
      completionPercentage: 0,
      timeSpent: 0,
      averageScore: 0,
      progress: new Map()
    });

    await studentProfile.save();

    // Update course enrolled count
    course.enrolledCount += 1;
    await course.save();

    res.status(201).json({ message: 'Successfully enrolled in course' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentEnrolledCourses = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty enrolled courses array');
      return res.json({ courses: [] });
    }
    
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('courseProgress.courseId');

    if (!studentProfile) {
      res.json({ courses: [] });
      return;
    }

    const enrolledCourses = studentProfile.courseProgress.map((progress: any) => ({
      ...progress.courseId.toObject(),
      isEnrolled: true,
      progress: progress.completionPercentage,
      enrollment: {
        enrolledAt: progress.enrolledAt,
        progress: progress.completionPercentage,
        lastAccessedAt: progress.lastAccessed
      }
    }));

    res.json({ courses: enrolledCourses });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentInProgressCourses = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty in-progress courses array');
      return res.json({ courses: [] });
    }
    
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('courseProgress.courseId');

    if (!studentProfile) {
      res.json({ courses: [] });
      return;
    }

    // Filter courses that are in progress (progress > 0 and < 100)
    const inProgressCourses = studentProfile.courseProgress
      .filter((progress: any) => progress.completionPercentage > 0 && progress.completionPercentage < 100)
      .map((progress: any) => ({
        ...progress.courseId.toObject(),
        isEnrolled: true,
        progress: progress.completionPercentage,
        enrollment: {
          enrolledAt: progress.enrolledAt,
          progress: progress.completionPercentage,
          lastAccessedAt: progress.lastAccessed
        }
      }));

    res.json({ courses: inProgressCourses });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, cannot update course progress');
      return res.status(503).json({ message: 'Database not available. Please try again later.' });
    }
    
    const { courseId } = req.params;
    const { lessonId, moduleId, duration, completionPercentage, quizScore } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!lessonId || !moduleId || duration === undefined || completionPercentage === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: lessonId, moduleId, duration, completionPercentage' 
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Find the course progress entry
    const courseProgressIndex = studentProfile.courseProgress.findIndex(
      (progress: any) => progress.courseId.toString() === courseId
    );

    if (courseProgressIndex === -1) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }

    const courseProgress = studentProfile.courseProgress[courseProgressIndex];

    // Add lesson to completed lessons if not already there
    if (!courseProgress.lessonsCompleted.includes(lessonId)) {
      courseProgress.lessonsCompleted.push(lessonId);
    }

    // Update progress fields
    courseProgress.completionPercentage = Math.min(completionPercentage, 100);
    courseProgress.timeSpent += duration;
    courseProgress.lastAccessed = new Date();
    
    // Update lesson-specific progress in progress map
    if (!courseProgress.progress) {
      courseProgress.progress = new Map();
    }
    courseProgress.progress.set(lessonId, completionPercentage);

    // Set current lesson and module for continuation
    courseProgress.currentLesson = lessonId;
    courseProgress.currentModule = moduleId;

    await studentProfile.save();

    res.json({
      message: 'Progress updated successfully',
      completionPercentage: courseProgress.completionPercentage,
      currentLesson: courseProgress.currentLesson,
      currentModule: courseProgress.currentModule,
      lessonsCompleted: courseProgress.lessonsCompleted.length,
      totalLessons: courseProgress.totalLessons
    });
  } catch (error: any) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getStudentCompletedCourses = async (req: AuthRequest, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning empty completed courses array');
      return res.json({ courses: [] });
    }
    
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('courseProgress.courseId');

    if (!studentProfile) {
      res.json({ courses: [] });
      return;
    }

    // Filter courses that are completed (progress = 100)
    const completedCourses = studentProfile.courseProgress
      .filter((progress: any) => progress.completionPercentage === 100)
      .map((progress: any) => ({
        ...progress.courseId.toObject(),
        isEnrolled: true,
        progress: progress.completionPercentage,
        enrollment: {
          enrolledAt: progress.enrolledAt,
          progress: progress.completionPercentage,
          completedAt: progress.lastAccessed
        }
      }));

    res.json({ courses: completedCourses });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
