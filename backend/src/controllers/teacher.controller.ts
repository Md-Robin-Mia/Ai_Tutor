import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import TeacherProfile from '../models/TeacherProfile.model';
import Course from '../models/Course.model';
import Category from '../models/Category.model';
import StudentProfile from '../models/StudentProfile.model';
import User from '../models/User.model';
import PaymentTransaction from '../models/PaymentTransaction.model';

export const getClassrooms = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user._id }).populate('classrooms.students');
    res.json({ classrooms: profile?.classrooms || [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createClassroom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, subject, grade } = req.body;
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      res.status(404).json({ message: 'Teacher profile not found' });
      return;
    }

    profile.classrooms.push({ name, subject, grade, students: [], createdAt: new Date() });
    await profile.save();

    res.status(201).json({ classroom: profile.classrooms[profile.classrooms.length - 1] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, subject, dueDate, assignedTo, quizId } = req.body;
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      res.status(404).json({ message: 'Teacher profile not found' });
      return;
    }

    profile.assignments.push({ title, description, subject, dueDate, assignedTo, quizId, createdAt: new Date() });
    await profile.save();

    res.status(201).json({ assignment: profile.assignments[profile.assignments.length - 1] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.json({
        classOverview: {
          totalStudents: 0,
          averagePerformance: 0,
          activeLearnersToday: 0,
          onlineNow: 0,
          totalStudyTimeToday: 0,
          quizzesCompletedToday: 0
        },
        studentPerformance: [],
        assignments: [],
        analytics: {
          topicWisePerformance: {},
          quizScoreDistribution: {}
        },
        realTimeActivity: []
      });
    }

    // Get all courses taught by this teacher
    const teacherCourses = await Course.find({ instructor: req.user._id });
    const courseIds = teacherCourses.map(course => course._id);

    // Get all enrolled students through payment transactions
    const enrolledStudents = await PaymentTransaction.find({
      teacher: req.user._id,
      paymentStatus: 'completed'
    }).populate('student', 'name email');

    // Get unique student IDs from payment transactions
    const uniqueStudentIds = [...new Set(enrolledStudents.map(tx => (tx.student as any)._id))];

    // Find all student profiles for enrolled students
    const studentProfiles = await StudentProfile.find({
      userId: { $in: uniqueStudentIds }
    }).populate('userId', 'name email');

    // Calculate real performance metrics
    let totalStudents = uniqueStudentIds.length;
    let totalPerformance = 0;
    let totalStudyTimeToday = 0;
    let quizzesCompletedToday = 0;
    let activeLearnersToday = 0;
    let onlineNow = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentPerformanceData = studentProfiles.map(studentProfile => {
      const user = studentProfile.userId as any;
      const studentName = user?.name || 'Unknown Student';
      
      // Get course progress for teacher's courses only
      const teacherCourseProgress = studentProfile.courseProgress.filter(
        progress => courseIds.some(id => id.toString() === progress.courseId.toString())
      );

      // Calculate average progress and accuracy across teacher's courses
      let totalProgress = 0;
      let totalAccuracy = 0;
      let courseCount = 0;

      teacherCourseProgress.forEach(progress => {
        totalProgress += progress.completionPercentage;
        totalAccuracy += progress.averageScore;
        courseCount++;
      });

      const avgProgress = courseCount > 0 ? Math.round(totalProgress / courseCount) : 0;
      const avgAccuracy = courseCount > 0 ? Math.round(totalAccuracy / courseCount) : 0;

      // Calculate today's study time and quiz attempts
      const todaySessions = studentProfile.studySessions.filter(session => {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      const todayStudyTime = todaySessions.reduce((total, session) => total + session.duration, 0);
      const todayQuizAttempts = todaySessions.filter(session => session.quizScore !== undefined).length;

      // Check if student was active today
      const isActiveToday = todayStudyTime > 0 || todayQuizAttempts > 0;
      
      // Check if student is online (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isOnline = studentProfile.lastStudyDate && studentProfile.lastStudyDate > fiveMinutesAgo;

      // Update totals
      totalPerformance += avgAccuracy;
      totalStudyTimeToday += todayStudyTime;
      quizzesCompletedToday += todayQuizAttempts;
      if (isActiveToday) activeLearnersToday++;
      if (isOnline) onlineNow++;

      // Get weak areas from student profile
      const weakAreas = studentProfile.weakAreas
        .filter(area => area.needsRevision)
        .slice(0, 3)
        .map(area => area.topic);

      // Get current activity
      const recentSession = studentProfile.studySessions[studentProfile.studySessions.length - 1];
      const currentActivity = recentSession ? recentSession.topic : 'Not active';
      const lastActive = studentProfile.lastStudyDate ? studentProfile.lastStudyDate.toISOString() : new Date().toISOString();

      return {
        name: studentName,
        progress: avgProgress,
        accuracy: avgAccuracy,
        weakAreas,
        lastActive,
        currentActivity,
        isOnline,
        timeSpentToday: Math.round(todayStudyTime),
        quizAttemptsToday: todayQuizAttempts
      };
    });

    // Calculate average performance
    const averagePerformance = totalStudents > 0 ? Math.round(totalPerformance / totalStudents) : 0;

    // Get assignments from teacher profile
    const assignments = profile.assignments.map(assignment => ({
      title: assignment.title,
      dueDate: assignment.dueDate,
      submissions: Math.floor(Math.random() * totalStudents), // This can be made real with assignment tracking
      pendingSubmissions: Math.floor(Math.random() * Math.max(1, totalStudents / 4))
    }));

    // Calculate topic-wise performance
    const topicWisePerformance: Record<string, number> = {};
    const topicWiseScores: Record<string, number[]> = {};
    const quizScoreDistribution: Record<string, number> = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'below-70': 0
    };

    studentProfiles.forEach(studentProfile => {
      studentProfile.courseProgress.forEach(progress => {
        if (courseIds.some(id => id.toString() === progress.courseId.toString())) {
          const score = progress.averageScore;
          
          // Add to topic-wise scores (using course title as topic)
          const topic = progress.courseTitle;
          if (!topicWiseScores[topic]) {
            topicWiseScores[topic] = [];
          }
          topicWiseScores[topic].push(score);

          // Add to score distribution
          if (score >= 90) quizScoreDistribution['90-100']++;
          else if (score >= 80) quizScoreDistribution['80-89']++;
          else if (score >= 70) quizScoreDistribution['70-79']++;
          else if (score >= 60) quizScoreDistribution['60-69']++;
          else quizScoreDistribution['below-70']++;
        }
      });
    });

    // Calculate average for each topic
    Object.keys(topicWiseScores).forEach(topic => {
      const scores = topicWiseScores[topic];
      topicWisePerformance[topic] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    // Create real-time activity from recent sessions
    const realTimeActivity = studentProfiles
      .flatMap(studentProfile => {
        const user = studentProfile.userId as any;
        const studentName = user?.name || 'Unknown Student';
        
        return studentProfile.studySessions
          .filter(session => Date.now() - new Date(session.timestamp).getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
          .slice(-3) // Last 3 sessions per student
          .map(session => ({
            studentId: studentProfile._id.toString(),
            name: studentName,
            activity: session.quizScore !== undefined 
              ? `Completed ${session.topic} Quiz (Score: ${session.quizScore}%)`
              : `Studied ${session.topic}`,
            timestamp: session.timestamp.toISOString(),
            type: session.quizScore !== undefined ? 'quiz_complete' : 'lesson_complete',
            data: {
              quizTitle: session.quizScore !== undefined ? session.topic : undefined,
              score: session.quizScore,
              lessonTitle: session.quizScore === undefined ? session.topic : undefined,
              minutes: session.duration
            }
          }));
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Top 10 recent activities

    return res.json({
      classOverview: {
        totalStudents,
        averagePerformance,
        activeLearnersToday,
        onlineNow,
        totalStudyTimeToday,
        quizzesCompletedToday
      },
      studentPerformance: studentPerformanceData,
      assignments,
      analytics: {
        topicWisePerformance,
        quizScoreDistribution
      },
      realTimeActivity
    });
  } catch (error: any) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getClassAnalytics = async (_req: AuthRequest, res: Response) => {
  try {
    res.json({ message: 'Class analytics coming soon' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new course with video and thumbnail uploads
export const createCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { 
      title, 
      description, 
      categoryId, 
      level, 
      price, 
      isFree, 
      totalLessons, 
      duration,
      requirements,
      whatYouLearn,
      targetAudience,
      publishNow
    } = req.body;
    
    // Parse JSON strings
    const parsedRequirements = JSON.parse(requirements || '[]');
    const parsedWhatYouLearn = JSON.parse(whatYouLearn || '[]');
    const parsedTargetAudience = JSON.parse(targetAudience || '[]');
    
    // Parse lessons from form data
    let parsedLessons = [];
    const lessonsData = req.body.lessons;
    if (lessonsData) {
      if (typeof lessonsData === 'string') {
        parsedLessons = JSON.parse(lessonsData);
      } else if (Array.isArray(lessonsData)) {
        parsedLessons = lessonsData;
      }
    }
    
    // Filter out empty lessons and validate lesson data
    parsedLessons = parsedLessons.filter((lesson: any) => {
      return lesson.title && lesson.title.trim() !== '' && 
             lesson.description && lesson.description.trim() !== '';
    });
    
    // Ensure all lessons have valid numeric values
    parsedLessons = parsedLessons.map((lesson: any, index: number) => ({
      ...lesson,
      duration: parseInt(lesson.duration) || 10, // Default to 10 minutes if invalid
      order: parseInt(lesson.order) || (index + 1), // Use index + 1 if invalid
      isPreview: lesson.isPreview === 'true'
    }));
    
    // Handle file uploads with upload.any()
    let thumbnailUrl = '';
    const videoFiles: any[] = [];
    
    if (req.files && Array.isArray(req.files)) {
      // Separate thumbnail and video files
      req.files.forEach((file: any) => {
        if (file.fieldname === 'thumbnail') {
          thumbnailUrl = `/uploads/thumbnails/${file.filename}`;
        } else if (file.fieldname.startsWith('lessonVideos[')) {
          videoFiles.push(file);
        }
      });
    }
    
    // Set instructor to current user
    const instructorId = req.user._id;
    
    // Get category details
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const courseData: any = {
      title,
      description,
      thumbnail: thumbnailUrl || '/images/default-course-thumbnail.jpg', // Default thumbnail if none provided
      category: { name: category.name, _id: categoryId }, // Will be populated properly
      level,
      price: parseFloat(price),
      isFree: isFree === 'true',
      totalLessons: parsedLessons.length || parseInt(totalLessons) || 1, // Use actual lesson count
      duration: parsedLessons.reduce((sum: number, lesson: any) => sum + (parseInt(lesson.duration) || 0), 0) || parseFloat(duration) || 1, // Calculate total duration
      requirements: parsedRequirements,
      whatYouLearn: parsedWhatYouLearn,
      targetAudience: parsedTargetAudience,
      instructor: instructorId,
      lessons: [],
      slug,
      published: publishNow === 'true', // Set published status based on publishNow parameter
      approvedByAdmin: false // Always requires admin approval first
    };
    
    // Process lessons with video files
    const processedLessons = parsedLessons.map((lesson: any, index: number) => {
      const lessonVideo = videoFiles[index]; // Use the videoFiles array we built
      
      return {
        title: lesson.title,
        description: lesson.description,
        duration: parseInt(lesson.duration),
        videoUrl: lessonVideo ? `/uploads/videos/${lessonVideo.filename}` : '',
        order: parseInt(lesson.order),
        isPreview: lesson.isPreview === 'true'
      };
    });
    
    courseData.lessons = processedLessons;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category._id', 'level', 'price', 'totalLessons', 'duration'];
    const missingFields = requiredFields.filter((field) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return !courseData[parent] || courseData[parent][child] === undefined || courseData[parent][child] === null;
      }
      return courseData[field] === undefined || courseData[field] === null;
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Create course
    const course = await Course.create(courseData);
    
    // Populate instructor details
    await course.populate('instructor', 'name email');
    
    return res.status(201).json({
      message: publishNow === 'true' ? 'Course created and submitted for approval' : 'Course saved as draft',
      course
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    
    if (error.code === 11000) {
      // Duplicate key error (slug)
      return res.status(400).json({ message: 'Course title already exists' });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Failed to create course' 
    });
  }
};

// Update an existing course
export const updateCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;
    const { 
      title, 
      description, 
      category, 
      level, 
      price, 
      isFree, 
      totalLessons, 
      duration,
      requirements,
      whatYouLearn,
      targetAudience,
      lessons,
      published
    } = req.body;
    
    // Find the course and ensure it belongs to the current teacher
    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you do not have permission to edit it' });
    }
    
    // Handle publish-only request (when only published parameter is sent or it's a publish endpoint)
    const isPublishEndpoint = req.path.includes('/publish');
    
    if ((published !== undefined && Object.keys(req.body).length <= 2) || isPublishEndpoint) {
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { published: published === true },
        { new: true, runValidators: true }
      ).populate('instructor', 'name email');
      
      return res.status(200).json({
        message: published === true ? 'Course published successfully' : 'Course unpublished successfully',
        course: updatedCourse
      });
    }
    
    // For full course updates, validate required fields
    if (!category) {
      return res.status(400).json({ message: 'Category is required for course updates' });
    }
    
    // Parse JSON strings
    const parsedRequirements = JSON.parse(requirements || '[]');
    const parsedWhatYouLearn = JSON.parse(whatYouLearn || '[]');
    const parsedTargetAudience = JSON.parse(targetAudience || '[]');
    const parsedLessons = JSON.parse(lessons || '[]');
    
    // Filter out empty lessons and validate lesson data
    const filteredLessons = parsedLessons.filter((lesson: any) => {
      return lesson.title && lesson.title.trim() !== '' && 
             lesson.description && lesson.description.trim() !== '';
    });
    
    // Ensure all lessons have valid numeric values
    const processedLessons = filteredLessons.map((lesson: any, index: number) => ({
      ...lesson,
      duration: parseInt(lesson.duration) || 10,
      order: parseInt(lesson.order) || (index + 1),
      isPreview: lesson.isPreview === 'true'
    }));
    
    // Get category details
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Handle thumbnail upload if provided
    let thumbnailUrl = course.thumbnail; // Keep existing thumbnail by default
    if (req.files && Array.isArray(req.files)) {
      const thumbnailFile = req.files.find((file: any) => file.fieldname === 'thumbnail');
      if (thumbnailFile) {
        thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;
      }
    }
    
    // Update course data
    const updateData: any = {
      title,
      description,
      thumbnail: thumbnailUrl,
      category: { name: categoryDoc.name, _id: category },
      level,
      price: parseFloat(price),
      isFree: isFree === 'true',
      totalLessons: parseInt(totalLessons) || processedLessons.length,
      duration: parseFloat(duration) || processedLessons.reduce((sum: number, lesson: any) => sum + (parseInt(lesson.duration) || 0), 0),
      requirements: parsedRequirements.filter(req => req.trim() !== ''),
      whatYouLearn: parsedWhatYouLearn.filter(item => item.trim() !== ''),
      targetAudience: parsedTargetAudience.filter(item => item.trim() !== ''),
      lessons: processedLessons
    };
    
    // Include published status if provided
    if (published !== undefined) {
      updateData.published = published === true;
    }
    
    // Update slug if title changed
    if (title !== course.title) {
      const newSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateData.slug = newSlug;
    }
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');
    
    return res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course title already exists' });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Failed to update course' 
    });
  }
};

// Get a single course by ID (for teacher)
export const getTeacherCourseById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;
    
    // Find the course and ensure it belongs to the current teacher
    const course = await Course.findOne({ _id: courseId, instructor: req.user._id })
      .populate('instructor', 'name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or you do not have permission to view it' });
    }
    
    return res.status(200).json({ course });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch course' 
    });
  }
};

// Get all courses created by the current teacher
export const getTeacherCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const teacherId = req.user._id;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    // Build filter
    const filter: any = { instructor: teacherId };
    
    if (status === 'published') {
      filter.published = true;
    } else if (status === 'draft') {
      filter.published = false;
    } else if (status === 'approved') {
      filter.approvedByAdmin = true;
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(filter);

    return res.json({
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching teacher courses:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch courses' 
    });
  }
};

// Create a new category
export const createCategory = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { name, description, icon, color } = req.body;

    console.log('Creating category with data:', { name, description, icon, color });
    console.log('User ID:', req.user._id);

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Generate slug manually to ensure it exists
    const slug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    console.log('Generated slug:', slug);

    // Create new category with explicit slug
    const categoryData = {
      name: name.trim(),
      slug: slug,
      description: description?.trim() || undefined,
      icon: icon || 'BookOpen',
      color: color || '#3B82F6',
      createdBy: req.user._id
    };

    console.log('Category data to create:', categoryData);

    const category = await Category.create(categoryData);

    console.log('Category created successfully:', category);

    return res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    return res.status(500).json({ 
      message: error.message || 'Failed to create category' 
    });
  }
};

// Get all categories (both active and inactive for teachers)
export const getCategories = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Check if there are any categories in the database
    const categoryCount = await Category.countDocuments();
    
    // If no categories exist, create some default ones
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Mathematics', description: 'Math courses and tutorials', icon: 'Calculator', color: '#3B82F6' },
        { name: 'Science', description: 'Science and research courses', icon: 'Microscope', color: '#10B981' },
        { name: 'Computer Science', description: 'Programming and tech courses', icon: 'Code', color: '#8B5CF6' },
        { name: 'Arts & Design', description: 'Creative and artistic courses', icon: 'Palette', color: '#EC4899' },
        { name: 'Languages', description: 'Language learning courses', icon: 'Globe', color: '#F59E0B' },
        { name: 'Business', description: 'Business and entrepreneurship', icon: 'Briefcase', color: '#EF4444' },
        { name: 'Health & Fitness', description: 'Health and wellness courses', icon: 'Heart', color: '#14B8A6' },
        { name: 'Music', description: 'Music theory and instruments', icon: 'Music', color: '#F97316' }
      ];

      // Create default categories - use req.user._id if available, otherwise use a placeholder
      const userId = _req.user?._id || new mongoose.Types.ObjectId();
      
      for (const cat of defaultCategories) {
        await Category.create({
          ...cat,
          createdBy: userId
        });
      }
    }

    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('_id name slug description icon color');

    return res.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch categories' 
    });
  }
};

// Get categories created by the current teacher
export const getTeacherCategories = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const categories = await Category.find({ createdBy: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    return res.json({ categories });
  } catch (error: any) {
    console.error('Error fetching teacher categories:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch teacher categories' 
    });
  }
};

// Update a category
export const updateCategory = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await Category.findOne({ _id: id, createdBy: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is being changed and if it conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    // Update category
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim() || undefined;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    return res.status(500).json({ 
      message: error.message || 'Failed to update category' 
    });
  }
};

// Delete a category (soft delete by setting isActive to false)
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, createdBy: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by any courses
    const coursesUsingCategory = await Course.countDocuments({ 'category._id': id });

    if (coursesUsingCategory > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is being used by courses' 
      });
    }

    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(id, { isActive: false });

    return res.json({
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to delete category' 
    });
  }
};
