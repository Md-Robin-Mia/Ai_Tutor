import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TeacherWallet, { WithdrawalStatus, WithdrawalMethod } from '../models/TeacherWallet.model';
import PaymentTransaction from '../models/PaymentTransaction.model';
import User, { UserRole } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class WithdrawalController {
  // Request withdrawal
  static async requestWithdrawal(req: AuthRequest, res: Response) {
    try {
      const { amount, withdrawalMethod, accountInfo } = req.body;
      const teacherId = (req.user as any)?._id;

      if (!teacherId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Validate user is a teacher
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== UserRole.TEACHER) {
        return res.status(403).json({ message: 'Only teachers can request withdrawals' });
      }

      // Validate withdrawal amount
      if (amount < 50) {
        return res.status(400).json({ message: 'Minimum withdrawal amount is 50 BDT' });
      }

      // Get or create teacher wallet
      let wallet = await TeacherWallet.findOne({ teacher: teacherId });
      if (!wallet) {
        return res.status(404).json({ message: 'Teacher wallet not found' });
      }

      // Check available balance
      if (amount > wallet.availableBalance) {
        return res.status(400).json({ 
          message: 'Insufficient balance',
          availableBalance: wallet.availableBalance,
          requestedAmount: amount
        });
      }

      // Validate account information based on withdrawal method
      const validationResult = WithdrawalController.validateAccountInfo(withdrawalMethod, accountInfo);
      if (!validationResult.isValid) {
        return res.status(400).json({ 
          message: 'Invalid account information',
          errors: validationResult.errors
        });
      }

      // Create withdrawal request
      wallet.withdrawalRequests.push({
        teacher: teacherId,
        amount,
        withdrawalMethod,
        accountInfo,
        status: WithdrawalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
      wallet.availableBalance -= amount;
      wallet.pendingWithdrawals += amount;

      await wallet.save();

      const newWithdrawal = wallet.withdrawalRequests[wallet.withdrawalRequests.length - 1];

      return res.status(201).json({
        message: 'Withdrawal request submitted successfully',
        withdrawal: {
          id: newWithdrawal._id,
          transactionId: newWithdrawal.transactionId,
          amount,
          withdrawalMethod,
          status: newWithdrawal.status,
          createdAt: newWithdrawal.createdAt
        }
      });
    } catch (error) {
      console.error('Request withdrawal error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Validate account information based on withdrawal method
  private static validateAccountInfo(method: WithdrawalMethod, accountInfo: any) {
    const errors: string[] = [];

    switch (method) {
      case WithdrawalMethod.NAGAD:
      case WithdrawalMethod.BIKASH:
        if (!accountInfo.phoneNumber) {
          errors.push('Phone number is required for mobile banking');
        } else if (!/^(?:\+88|01)?(?:\d{11}|\d{13})$/.test(accountInfo.phoneNumber)) {
          errors.push('Invalid Bangladeshi phone number format');
        }
        break;

      case WithdrawalMethod.BANK_CARD:
        if (!accountInfo.cardNumber) {
          errors.push('Card number is required');
        } else if (!/^\d{16}$/.test(accountInfo.cardNumber.replace(/\s/g, ''))) {
          errors.push('Invalid card number format');
        }
        if (!accountInfo.accountHolderName) {
          errors.push('Account holder name is required');
        }
        break;

      case WithdrawalMethod.BANK_TRANSFER:
        if (!accountInfo.bankName) {
          errors.push('Bank name is required');
        }
        if (!accountInfo.accountHolderName) {
          errors.push('Account holder name is required');
        }
        if (!accountInfo.routingNumber) {
          errors.push('Routing number is required');
        }
        break;

      default:
        errors.push('Invalid withdrawal method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get teacher's withdrawal history
  static async getWithdrawalHistory(req: AuthRequest, res: Response) {
    try {
      const teacherId = (req.user as any)?._id;

      if (!teacherId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const wallet = await TeacherWallet.findOne({ teacher: teacherId })
        .populate('withdrawalRequests.teacher', 'name email');

      if (!wallet) {
        return res.status(404).json({ message: 'Teacher wallet not found' });
      }

      const withdrawals = wallet.withdrawalRequests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return res.status(200).json({ withdrawals });
    } catch (error) {
      console.error('Get withdrawal history error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get teacher wallet information
  static async getWalletInfo(req: AuthRequest, res: Response) {
    try {
      const teacherId = (req.user as any)?._id;

      if (!teacherId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const wallet = await TeacherWallet.findOne({ teacher: teacherId });

      if (!wallet) {
        return res.status(404).json({ message: 'Teacher wallet not found' });
      }

      // Get recent transactions
      const recentTransactions = await PaymentTransaction.find({ 
        teacher: teacherId,
        paymentStatus: 'completed'
      })
      .populate('course', 'title')
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

      return res.status(200).json({
        wallet: {
          totalEarnings: wallet.totalEarnings,
          availableBalance: wallet.availableBalance,
          pendingWithdrawals: wallet.pendingWithdrawals,
          totalWithdrawn: wallet.totalWithdrawn,
          currency: wallet.currency,
          lastEarningDate: wallet.lastEarningDate
        },
        recentTransactions
      });
    } catch (error) {
      console.error('Get wallet info error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Cancel withdrawal request (for pending requests only)
  static async cancelWithdrawal(req: AuthRequest, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const teacherId = (req.user as any)?._id;

      if (!teacherId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const wallet = await TeacherWallet.findOne({ teacher: teacherId });
      if (!wallet) {
        return res.status(404).json({ message: 'Teacher wallet not found' });
      }

      const withdrawal = wallet.withdrawalRequests.find(w => w._id.toString() === withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        return res.status(400).json({ message: 'Can only cancel pending withdrawal requests' });
      }

      // Update withdrawal status
      withdrawal.status = WithdrawalStatus.CANCELLED;

      // Refund amount to available balance
      wallet.availableBalance += withdrawal.amount;
      wallet.pendingWithdrawals -= withdrawal.amount;

      await wallet.save();

      return res.status(200).json({
        message: 'Withdrawal request cancelled successfully',
        refundedAmount: withdrawal.amount
      });
    } catch (error) {
      console.error('Cancel withdrawal error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get earnings summary (for dashboard)
  static async getEarningsSummary(req: AuthRequest, res: Response) {
    try {
      const teacherId = (req.user as any)?._id;
      const { period = 'monthly' } = req.query;

      if (!teacherId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const wallet = await TeacherWallet.findOne({ teacher: teacherId });
      if (!wallet) {
        return res.status(404).json({ message: 'Teacher wallet not found' });
      }

      // Calculate period-based earnings
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

      const periodTransactions = await PaymentTransaction.find({
        teacher: teacherId,
        paymentStatus: 'completed',
        createdAt: { $gte: startDate }
      });

      const periodEarnings = periodTransactions.reduce((sum, transaction) => 
        sum + transaction.teacherEarnings, 0
      );

      const periodSales = periodTransactions.length;

      return res.status(200).json({
        summary: {
          totalEarnings: wallet.totalEarnings,
          availableBalance: wallet.availableBalance,
          totalWithdrawn: wallet.totalWithdrawn,
          pendingWithdrawals: wallet.pendingWithdrawals,
          periodEarnings,
          periodSales,
          period
        }
      });
    } catch (error) {
      console.error('Get earnings summary error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
