import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.model';
import PaymentTransaction, { PaymentStatus, PaymentMethod } from '../models/PaymentTransaction.model';
import TeacherWallet, { WithdrawalStatus } from '../models/TeacherWallet.model';
import StudentPurchaseHistory from '../models/StudentPurchaseHistory.model';
import StudentWallet from '../models/StudentWallet.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Constants
const ADMIN_COMMISSION_RATE = 0.20; // 20% commission

export class PaymentController {
  // Process course purchase
  static async purchaseCourse(req: AuthRequest, res: Response) {
    try {
      const { courseId, paymentMethod } = req.body;
      const studentId = (req.user as any)?._id;

      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Validate course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.price === 0) {
        return res.status(400).json({ message: 'This course is free' });
      }

      if (!course.published || !course.approvedByAdmin) {
        return res.status(400).json({ message: 'Course is not available for purchase' });
      }

      // Check if student already enrolled
      // Note: You'll need to implement enrollment tracking
      // This is a placeholder - implement based on your enrollment system

      // Calculate commission and earnings
      const coursePrice = course.price;
      const adminCommission = Math.round(coursePrice * ADMIN_COMMISSION_RATE);
      const teacherEarnings = coursePrice - adminCommission;

      // Map frontend payment method to backend enum
      let mappedPaymentMethod: PaymentMethod;
      switch (paymentMethod) {
        case 'card':
        case 'credit_card':
          mappedPaymentMethod = PaymentMethod.CREDIT_CARD;
          break;
        case 'debit_card':
          mappedPaymentMethod = PaymentMethod.DEBIT_CARD;
          break;
        case 'nagad':
          mappedPaymentMethod = PaymentMethod.NAGAD;
          break;
        case 'bkash':
          mappedPaymentMethod = PaymentMethod.BIKASH;
          break;
        case 'rocket':
          mappedPaymentMethod = PaymentMethod.ROCKET;
          break;
        case 'bank_transfer':
          mappedPaymentMethod = PaymentMethod.BANK_TRANSFER;
          break;
        default:
          mappedPaymentMethod = PaymentMethod.CREDIT_CARD; // Default fallback
      }

      // Create payment transaction
      const transaction = new PaymentTransaction({
        student: studentId,
        course: courseId,
        teacher: course.instructor,
        amount: coursePrice,
        adminCommission,
        teacherEarnings,
        paymentMethod: mappedPaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        currency: 'BDT'
      });

      await transaction.save();

      // Process payment (this would integrate with actual payment gateway)
      // For now, we'll simulate successful payment
      const paymentResult = await PaymentController.processPaymentGateway(transaction, mappedPaymentMethod);

      if (paymentResult.success) {
        // Update transaction status
        transaction.paymentStatus = PaymentStatus.COMPLETED;
        transaction.paymentGatewayResponse = paymentResult.response;
        await transaction.save();

        // Add earnings to teacher wallet
        await PaymentController.addTeacherEarnings(course.instructor, teacherEarnings, transaction._id);

        // Record purchase history for student
        await PaymentController.recordPurchaseHistory(studentId, courseId, course.instructor, coursePrice, mappedPaymentMethod, transaction.transactionId, course.title, course.instructor.toString());

        // Update student wallet (deduct amount)
        await PaymentController.updateStudentWallet(studentId, coursePrice, 'debit', 'Course purchase', transaction.transactionId, 'course_purchase');

        // Enroll student in course (implement this based on your enrollment system)
        await PaymentController.enrollStudent(studentId, courseId);

        return res.status(200).json({
          message: 'Course purchased successfully',
          transaction: {
            id: transaction.transactionId,
            amount: coursePrice,
            status: transaction.paymentStatus
          }
        });
      } else {
        transaction.paymentStatus = PaymentStatus.FAILED;
        transaction.paymentGatewayResponse = paymentResult.response;
        await transaction.save();

        return res.status(400).json({
          message: 'Payment failed',
          error: paymentResult.error
        });
      }
    } catch (error) {
      console.error('Purchase course error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Simulate payment gateway processing
  private static async processPaymentGateway(transaction: any, paymentMethod: PaymentMethod): Promise<{
    success: boolean;
    response?: any;
    error?: string;
  }> {
    // This is where you'd integrate with actual payment gateways
    // like SSLCommerz, bKash, Nagad, etc.
    
    // For demonstration, we'll simulate a successful payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          response: {
            gatewayTransactionId: 'GW' + Date.now(),
            paymentMethod,
            processedAt: new Date()
          }
        });
      }, 1000);
    });
  }

  // Add earnings to teacher wallet
  private static async addTeacherEarnings(teacherId: mongoose.Types.ObjectId, amount: number, transactionId: mongoose.Types.ObjectId) {
    try {
      let wallet = await TeacherWallet.findOne({ teacher: teacherId });
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new TeacherWallet({
          teacher: teacherId,
          totalEarnings: 0,
          availableBalance: 0,
          pendingWithdrawals: 0,
          totalWithdrawn: 0
        });
      }

      await wallet.addEarnings(amount);
      console.log(`Added ${amount} BDT to teacher ${teacherId} wallet from transaction ${transactionId}`);
    } catch (error) {
      console.error('Error adding teacher earnings:', error);
      throw error;
    }
  }

  // Enroll student in course with proper tracking
  private static async enrollStudent(studentId: string, courseId: string) {
    try {
      const StudentProfile = mongoose.model('StudentProfile');
      const Course = mongoose.model('Course');
      const User = mongoose.model('User');
      
      // Get course details
      const course = await Course.findById(courseId);
      if (!course) {
        console.error(`Course not found: ${courseId}`);
        return;
      }

      // Get student details
      const student = await User.findById(studentId);
      if (!student) {
        console.error(`Student not found: ${studentId}`);
        return;
      }

      // Find or create student profile
      let studentProfile = await StudentProfile.findOne({ userId: studentId });
      
      if (!studentProfile) {
        // Create student profile if it doesn't exist
        studentProfile = new StudentProfile({
          userId: studentId,
          level: 'beginner',
          xp: 0,
          currentLevel: 1,
          badges: [],
          studyStreak: 0,
          weakAreas: [],
          goals: [],
          studySessions: [],
          courseProgress: [],
          totalStudyTime: 0,
          subjects: [],
          skillsAssessed: new Map(),
          careerInterests: [],
          projectsCompleted: 0,
          certificatesEarned: []
        });
      }

      // Check if already enrolled in this course
      const existingProgress = studentProfile.courseProgress.find(
        progress => progress.courseId.toString() === courseId
      );

      if (!existingProgress) {
        // Add course progress entry
        studentProfile.courseProgress.push({
          courseId: course._id,
          courseTitle: course.title,
          enrolledAt: new Date(),
          lastAccessed: new Date(),
          lessonsCompleted: [],
          totalLessons: course.totalLessons || 0,
          completionPercentage: 0,
          timeSpent: 0,
          averageScore: 0,
          progress: new Map()
        });

        // Add course subject to student's subjects
        if (!studentProfile.subjects.includes(course.category?.name || 'General')) {
          studentProfile.subjects.push(course.category?.name || 'General');
        }

        await studentProfile.save();
        console.log(`Successfully enrolled student ${studentId} in course ${courseId}`);

        // Notify teacher via Socket.IO about new enrollment
        if (global.io) {
          global.io.to('teacher_dashboard').emit('real_time_update', {
            type: 'student_enrollment',
            payload: {
              studentId,
              studentName: student.name,
              courseId,
              courseTitle: course.title,
              teacherId: course.instructor.toString(),
              enrolledAt: new Date().toISOString()
            }
          });
        }

        // Emit student activity for enrollment
        const { studentSocketService } = require('../services/studentSocket.service');
        studentSocketService.emitStudentActivity(studentId, student.name, {
          activity: `Enrolled in ${course.title}`,
          activityType: 'lesson_start',
          data: {
            courseTitle: course.title,
            courseId: courseId
          }
        });
      } else {
        console.log(`Student ${studentId} already enrolled in course ${courseId}`);
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  // Record purchase history for student
  private static async recordPurchaseHistory(
    studentId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
    teacherId: mongoose.Types.ObjectId,
    amount: number,
    paymentMethod: string,
    transactionId: string,
    courseTitle: string,
    teacherName: string
  ) {
    try {
      const teacher = await User.findById(teacherId);
      const purchaseHistory = new StudentPurchaseHistory({
        studentId,
        courseId,
        teacherId,
        purchaseDate: new Date(),
        amount,
        paymentMethod,
        paymentStatus: 'completed',
        transactionId,
        courseTitle,
        teacherName: teacher?.name || teacherName,
        thumbnail: undefined // Will be populated from course
      });

      await purchaseHistory.save();
      console.log(`Recorded purchase history for student ${studentId}, course ${courseTitle}`);
    } catch (error) {
      console.error('Error recording purchase history:', error);
      throw error;
    }
  }

  // Update student wallet
  private static async updateStudentWallet(
    studentId: mongoose.Types.ObjectId,
    amount: number,
    type: 'credit' | 'debit',
    description: string,
    referenceId: string,
    referenceType: 'course_purchase' | 'refund' | 'wallet_recharge'
  ) {
    try {
      let wallet = await StudentWallet.findOne({ studentId });
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new StudentWallet({
          studentId,
          balance: 0,
          totalSpent: 0,
          currency: 'BDT'
        });
      }

      // Add transaction
      wallet.transactions.push({
        type,
        amount,
        description,
        referenceId,
        referenceType,
        createdAt: new Date()
      });

      // Update balance and total spent
      if (type === 'debit') {
        wallet.balance = Math.max(0, wallet.balance - amount);
        wallet.totalSpent += amount;
      } else {
        wallet.balance += amount;
      }

      wallet.lastUpdated = new Date();
      await wallet.save();
      
      console.log(`Updated student wallet for ${studentId}: ${type} ${amount} BDT`);
    } catch (error) {
      console.error('Error updating student wallet:', error);
      throw error;
    }
  }

  // Get student's purchase history
  static async getPurchaseHistory(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.user as any)?._id;
      
      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get purchase history from StudentPurchaseHistory model
      const purchases = await StudentPurchaseHistory.find({ studentId })
        .populate('courseId', 'title thumbnail')
        .populate('teacherId', 'name email')
        .sort({ purchaseDate: -1 });

      // Get student wallet info
      let wallet = await StudentWallet.findOne({ studentId });
      
      // If no wallet exists, return default values (0 balance, 0 history)
      if (!wallet) {
        return res.status(200).json({
          balance: 0,
          totalSpent: 0,
          currency: 'BDT',
          transactionCount: 0,
          transactions: []
        });
      }

      return res.status(200).json({ 
        purchases: purchases || [], // Return empty array if no purchases
        wallet: {
          balance: wallet.balance,
          totalSpent: wallet.totalSpent,
          currency: wallet.currency,
          transactionCount: wallet.transactions?.length || 0
        }
      });
    } catch (error) {
      console.error('Get purchase history error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get payment transaction details
  static async getTransactionDetails(req: AuthRequest, res: Response) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await PaymentTransaction.findOne({ transactionId })
        .populate('course', 'title thumbnail price')
        .populate('student', 'name email')
        .populate('teacher', 'name email');

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      return res.status(200).json({ transaction });
    } catch (error) {
      console.error('Get transaction details error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Request refund
  static async requestRefund(req: AuthRequest, res: Response) {
    try {
      const { transactionId, reason } = req.body;
      const studentId = (req.user as any)?._id;

      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const transaction = await PaymentTransaction.findOne({ 
        transactionId,
        student: studentId,
        paymentStatus: PaymentStatus.COMPLETED
      });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found or not eligible for refund' });
      }

      // Check if refund is already processed
      if (transaction.refundedAmount && transaction.refundedAmount > 0) {
        return res.status(400).json({ message: 'Refund already processed' });
      }

      // Update transaction with refund request
      transaction.paymentStatus = PaymentStatus.REFUNDED;
      transaction.refundedAmount = transaction.amount;
      transaction.refundReason = reason;
      transaction.refundDate = new Date();

      await transaction.save();

      // Deduct from teacher wallet (if earnings were already added)
      await PaymentController.deductTeacherEarnings(transaction.teacher, transaction.teacherEarnings);

      return res.status(200).json({
        message: 'Refund processed successfully',
        refundAmount: transaction.refundedAmount
      });
    } catch (error) {
      console.error('Request refund error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Deduct earnings from teacher wallet (for refunds)
  private static async deductTeacherEarnings(teacherId: mongoose.Types.ObjectId, amount: number) {
    try {
      const wallet = await TeacherWallet.findOne({ teacher: teacherId });
      
      if (!wallet) {
        console.error('Teacher wallet not found for refund deduction');
        return;
      }

      wallet.totalEarnings = Math.max(0, wallet.totalEarnings - amount);
      wallet.availableBalance = Math.max(0, wallet.availableBalance - amount);
      await wallet.save();
      
      console.log(`Deducted ${amount} BDT from teacher ${teacherId} wallet due to refund`);
    } catch (error) {
      console.error('Error deducting teacher earnings:', error);
    }
  }
}
