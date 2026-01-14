import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TeacherWallet, { WithdrawalStatus } from '../models/TeacherWallet.model';
import PaymentTransaction from '../models/PaymentTransaction.model';
import User, { UserRole } from '../models/User.model';
import Course from '../models/Course.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminPaymentController {
  // Get all withdrawal requests (for admin)
  static async getAllWithdrawalRequests(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      // Build filter
      const filter: any = {};
      if (status && status !== 'all') {
        filter['withdrawalRequests.status'] = status;
      }

      // Find wallets with withdrawal requests
      const wallets = await TeacherWallet.find(filter)
        .populate('teacher', 'name email')
        .sort({ 'withdrawalRequests.createdAt': -1 });

      // Extract and flatten all withdrawal requests
      let allWithdrawals: any[] = [];
      wallets.forEach(wallet => {
        wallet.withdrawalRequests.forEach(withdrawal => {
          allWithdrawals.push({
            ...withdrawal.toObject(),
            teacher: wallet.teacher,
            walletId: wallet._id
          });
        });
      });

      // Filter by status if specified
      if (status && status !== 'all') {
        allWithdrawals = allWithdrawals.filter(w => w.status === status);
      }

      // Sort by creation date
      allWithdrawals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedWithdrawals = allWithdrawals.slice(startIndex, endIndex);

      return res.status(200).json({
        withdrawals: paginatedWithdrawals,
        pagination: {
          current: Number(page),
          limit: Number(limit),
          total: allWithdrawals.length,
          pages: Math.ceil(allWithdrawals.length / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get all withdrawal requests error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Process withdrawal request (approve/reject)
  static async processWithdrawal(req: AuthRequest, res: Response) {
    try {
      const { withdrawalId, action, adminNotes } = req.body;
      const adminId = (req.user as any)?._id;

      if (!adminId) {
        return res.status(401).json({ message: 'Admin not authenticated' });
      }

      // Validate admin role
      const admin = await User.findById(adminId);
      if (!admin || (admin.role !== UserRole.ADMIN && !admin.isSuperAdmin)) {
        return res.status(403).json({ message: 'Only admins can process withdrawals' });
      }

      // Find the wallet containing this withdrawal
      const wallets = await TeacherWallet.find({ 'withdrawalRequests._id': withdrawalId });
      if (wallets.length === 0) {
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      const wallet = wallets[0];
      const withdrawal = wallet.withdrawalRequests.find(w => w._id.toString() === withdrawalId);

      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        return res.status(400).json({ message: 'Withdrawal request is not pending' });
      }

      if (action === 'approve') {
        // Approve withdrawal
        withdrawal.status = WithdrawalStatus.PROCESSING;
        withdrawal.processingDate = new Date();
        withdrawal.adminNotes = adminNotes;

        // Update wallet totals
        wallet.totalWithdrawn += withdrawal.amount;
        wallet.pendingWithdrawals -= withdrawal.amount;

        await wallet.save();

        // Here you would integrate with actual payment systems
        // For Nagad/Bikash/Card payments
        const paymentResult = await AdminPaymentController.processWithdrawalPayment(withdrawal);

        if (paymentResult.success) {
          withdrawal.status = WithdrawalStatus.COMPLETED;
          withdrawal.completedDate = new Date();
          await wallet.save();

          return res.status(200).json({
            message: 'Withdrawal processed successfully',
            withdrawal: {
              id: withdrawal._id,
              transactionId: withdrawal.transactionId,
              amount: withdrawal.amount,
              status: withdrawal.status,
              completedDate: withdrawal.completedDate
            }
          });
        } else {
          withdrawal.status = WithdrawalStatus.FAILED;
          withdrawal.failureReason = paymentResult.error;
          withdrawal.adminNotes = `Payment failed: ${paymentResult.error}`;
          
          // Refund amount back to available balance
          wallet.availableBalance += withdrawal.amount;
          wallet.pendingWithdrawals -= withdrawal.amount;
          wallet.totalWithdrawn -= withdrawal.amount;

          await wallet.save();

          return res.status(400).json({
            message: 'Withdrawal payment failed',
            error: paymentResult.error
          });
        }
      } else if (action === 'reject') {
        // Reject withdrawal
        withdrawal.status = WithdrawalStatus.CANCELLED;
        withdrawal.adminNotes = adminNotes;

        // Refund amount back to available balance
        wallet.availableBalance += withdrawal.amount;
        wallet.pendingWithdrawals -= withdrawal.amount;

        await wallet.save();

        return res.status(200).json({
          message: 'Withdrawal request rejected',
          refundedAmount: withdrawal.amount
        });
      } else {
        return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
      }
    } catch (error) {
      console.error('Process withdrawal error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Simulate withdrawal payment processing
  private static async processWithdrawalPayment(withdrawal: any): Promise<{
    success: boolean;
    transactionId?: string;
    processedAt?: Date;
    error?: string;
  }> {
    // This is where you'd integrate with actual payment systems
    // For Nagad, Bikash, bank transfers, etc.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful payment
        resolve({
          success: true,
          transactionId: 'PAY' + Date.now(),
          processedAt: new Date()
        });
      }, 2000);
    });
  }

  // Get payment analytics for admin
  static async getPaymentAnalytics(req: Request, res: Response) {
    try {
      const { period = 'monthly' } = req.query;

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get completed transactions in period
      const transactions = await PaymentTransaction.find({
        paymentStatus: 'completed',
        createdAt: { $gte: startDate }
      }).populate('course', 'title').populate('teacher', 'name');

      // Calculate totals
      const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
      const totalCommission = transactions.reduce((sum, t) => sum + t.adminCommission, 0);
      const totalTeacherEarnings = transactions.reduce((sum, t) => sum + t.teacherEarnings, 0);

      // Get withdrawal stats
      const wallets = await TeacherWallet.find();
      const totalAvailableBalance = wallets.reduce((sum, w) => sum + w.availableBalance, 0);
      const totalPendingWithdrawals = wallets.reduce((sum, w) => sum + w.pendingWithdrawals, 0);
      const totalWithdrawn = wallets.reduce((sum, w) => sum + w.totalWithdrawn, 0);

      // Get withdrawal requests in period
      let periodWithdrawals = 0;
      wallets.forEach(wallet => {
        wallet.withdrawalRequests.forEach(withdrawal => {
          if (withdrawal.createdAt >= startDate && withdrawal.status === WithdrawalStatus.COMPLETED) {
            periodWithdrawals += withdrawal.amount;
          }
        });
      });

      return res.status(200).json({
        analytics: {
          period,
          revenue: {
            total: totalRevenue,
            commission: totalCommission,
            teacherEarnings: totalTeacherEarnings,
            transactions: transactions.length
          },
          withdrawals: {
            totalAvailable: totalAvailableBalance,
            totalPending: totalPendingWithdrawals,
            totalWithdrawn: totalWithdrawn,
            periodWithdrawals
          },
          metrics: {
            averageTransactionValue: transactions.length > 0 ? totalRevenue / transactions.length : 0,
            commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
          }
        }
      });
    } catch (error) {
      console.error('Get payment analytics error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all payment transactions
  static async getAllTransactions(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10, teacherId, courseId } = req.query;

      // Build filter
      const filter: any = {};
      if (status && status !== 'all') {
        filter.paymentStatus = status;
      }
      if (teacherId) {
        filter.teacher = teacherId;
      }
      if (courseId) {
        filter.course = courseId;
      }

      const transactions = await PaymentTransaction.find(filter)
        .populate('course', 'title')
        .populate('teacher', 'name email')
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * Number(page));

      const totalCount = await PaymentTransaction.countDocuments(filter);

      // Pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedTransactions = transactions.slice(startIndex, endIndex);

      return res.status(200).json({
        transactions: paginatedTransactions,
        pagination: {
          current: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get all transactions error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get teacher earnings overview
  static async getTeacherEarningsOverview(req: Request, res: Response) {
    try {
      const wallets = await TeacherWallet.find()
        .populate('teacher', 'name email')
        .sort({ totalEarnings: -1 });

      const teacherEarnings = wallets.map(wallet => ({
        teacher: wallet.teacher,
        totalEarnings: wallet.totalEarnings,
        availableBalance: wallet.availableBalance,
        totalWithdrawn: wallet.totalWithdrawn,
        pendingWithdrawals: wallet.pendingWithdrawals,
        lastEarningDate: wallet.lastEarningDate
      }));

      // Calculate totals
      const totals = teacherEarnings.reduce((acc, teacher) => ({
        totalEarnings: acc.totalEarnings + teacher.totalEarnings,
        availableBalance: acc.availableBalance + teacher.availableBalance,
        totalWithdrawn: acc.totalWithdrawn + teacher.totalWithdrawn,
        pendingWithdrawals: acc.pendingWithdrawals + teacher.pendingWithdrawals
      }), { totalEarnings: 0, availableBalance: 0, totalWithdrawn: 0, pendingWithdrawals: 0 });

      return res.status(200).json({
        teacherEarnings,
        totals,
        totalTeachers: teacherEarnings.length
      });
    } catch (error) {
      console.error('Get teacher earnings overview error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Export payment data (CSV/Excel)
  static async exportPaymentData(req: Request, res: Response) {
    try {
      const { format = 'csv', startDate, endDate } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate as string);
      }

      const filter: any = {};
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }

      const transactions = await PaymentTransaction.find(filter)
        .populate('course', 'title')
        .populate('teacher', 'name email')
        .populate('student', 'name email')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        // Generate CSV
        const csv = [
          'Transaction ID,Date,Course,Teacher,Student,Amount,Admin Commission,Teacher Earnings,Status,Payment Method',
          ...transactions.map(t => 
            `${t.transactionId},${t.createdAt},${(t.course as any).title},${(t.teacher as any).name},${(t.student as any).name},${t.amount},${t.adminCommission},${t.teacherEarnings},${t.paymentStatus},${t.paymentMethod}`
          )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payment_data.csv');
        return res.status(200).send(csv);
      } else {
        return res.status(400).json({ message: 'Unsupported format. Use "csv"' });
      }
    } catch (error) {
      console.error('Export payment data error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
