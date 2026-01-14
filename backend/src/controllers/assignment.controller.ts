import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Assignment from '../models/Assignment.model';
import Course from '../models/Course.model';
import StudentProfile from '../models/StudentProfile.model';
import PaymentTransaction from '../models/PaymentTransaction.model';
import { studentSocketService } from '../services/studentSocket.service';

// Create a new assignment
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      type, 
      courseId, 
      questions, 
      timeLimit, 
      dueDate, 
      isDailyQuiz,
      scheduledDate 
    } = req.body;

    // Verify course belongs to teacher
    const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      type,
      teacher: req.user._id,
      course: courseId,
      courseTitle: course.title,
      questions,
      timeLimit,
      dueDate: new Date(dueDate),
      isDailyQuiz: isDailyQuiz || false,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      status: 'published'
    });

    // If it's a daily quiz, notify enrolled students
    if (isDailyQuiz) {
      const enrolledStudents = await PaymentTransaction.find({
        teacher: req.user._id,
        course: courseId,
        paymentStatus: 'completed'
      }).populate('student', 'name');

      enrolledStudents.forEach(enrollment => {
        const student = enrollment.student as any;
        if (student) {
          studentSocketService.emitQuizStart(
            enrollment.student.toString(),
            student.name,
            {
              quizTitle: title,
              subject: course.title,
              totalQuestions: questions.length
            }
          );
        }
      });
    }

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's assignments
export const getTeacherAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, status = 'all' } = req.query;
    
    // Build filter
    const filter: any = { teacher: req.user._id };
    if (courseId) filter.course = courseId;
    if (status !== 'all') filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    // Calculate today's quiz completions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayQuizzes = assignments.filter(assignment => 
      assignment.isDailyQuiz && 
      assignment.scheduledDate >= today && 
      assignment.scheduledDate < tomorrow
    );

    const quizzesCompletedToday = todayQuizzes.reduce((total, quiz) => {
      return total + quiz.submissions.filter(sub => 
        sub.submittedAt >= today && sub.submittedAt < tomorrow
      ).length;
    }, 0);

    res.json({
      assignments,
      stats: {
        totalAssignments: assignments.length,
        publishedAssignments: assignments.filter(a => a.status === 'published').length,
        todayQuizzes: todayQuizzes.length,
        quizzesCompletedToday
      }
    });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { answers, timeSpent } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify student is enrolled in the course
    const enrollment = await PaymentTransaction.findOne({
      student: req.user._id,
      course: assignment.course,
      paymentStatus: 'completed'
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Submit assignment
    await (assignment as any).submitAssignment(
      req.user._id,
      req.user.name || 'Student',
      answers,
      timeSpent || 0
    );

    // Notify teacher via socket
    studentSocketService.emitQuizComplete(
      req.user._id.toString(),
      req.user.name || 'Student',
      {
        quizTitle: assignment.title,
        score: assignment.averageScore,
        totalQuestions: assignment.questions.length,
        accuracy: assignment.averageScore
      }
    );

    // Emit assignment completion event
    if (global.io) {
      global.io.to('teacher_dashboard').emit('real_time_update', {
        type: 'assignment_submission',
        payload: {
          assignmentTitle: assignment.title,
          studentName: req.user.name || 'Student',
          teacherId: assignment.teacher.toString(),
          score: assignment.averageScore,
          completedAt: new Date().toISOString()
        }
      });
    }

    res.json({
      message: 'Assignment submitted successfully',
      score: assignment.averageScore,
      grade: assignment.submissions[assignment.submissions.length - 1]?.grade
    });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student assignments
export const getStudentAssignments = async (req: AuthRequest, res: Response) => {
  try {
    // Get courses student is enrolled in
    const enrollments = await PaymentTransaction.find({
      student: req.user._id,
      paymentStatus: 'completed'
    }).distinct('course');

    const assignments = await Assignment.find({
      course: { $in: enrollments },
      status: 'published'
    })
      .populate('course', 'title')
      .populate('teacher', 'name')
      .sort({ dueDate: 1 });

    // Mark submissions
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.student.toString() === req.user._id.toString()
      );

      return {
        ...assignment.toObject(),
        isSubmitted: !!submission,
        submission: submission || null,
        canSubmit: !submission && new Date() <= assignment.dueDate
      };
    });

    res.json({ assignments: assignmentsWithStatus });
  } catch (error: any) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Generate daily quizzes automatically
export const generateDailyQuizzes = async () => {
  try {
    console.log('Generating daily quizzes...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Schedule for 9 AM

    // Get all active courses
    const activeCourses = await Course.find({ published: true });

    for (const course of activeCourses) {
      // Check if daily quiz already exists for tomorrow
      const existingQuiz = await Assignment.findOne({
        course: course._id,
        isDailyQuiz: true,
        scheduledDate: {
          $gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
          $lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)
        }
      });

      if (!existingQuiz) {
        await (Assignment as any).createDailyQuiz(
          course.instructor,
          course._id,
          course.title,
          tomorrow
        );
        
        console.log(`Daily quiz created for course: ${course.title}`);
      }
    }

    console.log('Daily quiz generation completed');
  } catch (error) {
    console.error('Error generating daily quizzes:', error);
  }
};

// Get assignment analytics
export const getAssignmentAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, timeRange = '30' } = req.query;
    
    const filter: any = { teacher: req.user._id };
    if (courseId) filter.course = courseId;

    const daysBack = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const assignments = await Assignment.find({
      ...filter,
      createdAt: { $gte: startDate }
    });

    // Calculate analytics
    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce((sum, assignment) => sum + assignment.submissions.length, 0);
    const averageScore = assignments.reduce((sum, assignment) => sum + assignment.averageScore, 0) / totalAssignments || 0;
    
    const dailyQuizzes = assignments.filter(a => a.isDailyQuiz);
    const dailyQuizCompletions = dailyQuizzes.reduce((sum, quiz) => sum + quiz.submissions.length, 0);

    // Score distribution
    const scoreDistribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'below-60': 0
    };

    assignments.forEach(assignment => {
      assignment.submissions.forEach(submission => {
        const score = submission.score || 0;
        if (score >= 90) scoreDistribution['90-100']++;
        else if (score >= 80) scoreDistribution['80-89']++;
        else if (score >= 70) scoreDistribution['70-79']++;
        else if (score >= 60) scoreDistribution['60-69']++;
        else scoreDistribution['below-60']++;
      });
    });

    res.json({
      summary: {
        totalAssignments,
        totalSubmissions,
        averageCompletionRate: totalAssignments > 0 ? (totalSubmissions / totalAssignments) * 100 : 0,
        averageScore: Math.round(averageScore),
        dailyQuizzes: dailyQuizzes.length,
        dailyQuizCompletions
      },
      scoreDistribution,
      recentAssignments: assignments.slice(-10).map(a => ({
        id: a._id,
        title: a.title,
        type: a.type,
        submissions: a.submissions.length,
        averageScore: a.averageScore,
        createdAt: a.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching assignment analytics:', error);
    res.status(500).json({ message: error.message });
  }
};
