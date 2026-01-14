import { Request, Response } from 'express';
import mongoose from 'mongoose';
import StudentWallet from '../models/StudentWallet.model';
import StudentPurchaseHistory from '../models/StudentPurchaseHistory.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class StudentWalletController {
  // Get student wallet information
  static async getWalletInfo(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.user as any)?._id;
      
      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

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
        balance: wallet.balance,
        totalSpent: wallet.totalSpent,
        currency: wallet.currency,
        transactionCount: wallet.transactions.length,
        transactions: wallet.transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      });
    } catch (error) {
      console.error('Get wallet info error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get student purchase history
  static async getPurchaseHistory(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.user as any)?._id;
      
      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const purchases = await StudentPurchaseHistory.find({ studentId })
        .populate('courseId', 'title thumbnail price')
        .populate('teacherId', 'name email')
        .sort({ purchaseDate: -1 });

      return res.status(200).json({ 
        purchases: purchases || [], // Return empty array if no purchases
        count: purchases?.length || 0
      });
    } catch (error) {
      console.error('Get purchase history error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get student dashboard summary (wallet + purchase history)
  static async getDashboardSummary(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.user as any)?._id;
      
      console.log('🔍 Dashboard summary requested for student:', studentId);
      
      if (!studentId) {
        console.log('❌ No studentId found in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get wallet info
      let wallet = await StudentWallet.findOne({ studentId });
      console.log('🔍 Wallet found:', wallet ? 'Yes' : 'No');
      
      // Get purchase history
      const purchases = await StudentPurchaseHistory.find({ studentId })
        .populate('courseId', 'title thumbnail price')
        .populate('teacherId', 'name')
        .sort({ purchaseDate: -1 })
        .limit(5); // Get recent 5 purchases
      
      console.log('🔍 Purchases found:', purchases.length);

      // Default values if no wallet exists
      const walletInfo = wallet ? {
        balance: wallet.balance,
        totalSpent: wallet.totalSpent,
        currency: wallet.currency,
        transactionCount: wallet.transactions.length
      } : {
        balance: 0,
        totalSpent: 0,
        currency: 'BDT',
        transactionCount: 0
      };

      const response = {
        wallet: walletInfo,
        recentPurchases: purchases || [],
        totalPurchases: purchases?.length || 0
      };

      console.log('📊 Sending dashboard response:', {
        walletBalance: response.wallet.balance,
        purchasesCount: response.recentPurchases.length
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error('❌ Get dashboard summary error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Add funds to wallet (for future implementation)
  static async addFunds(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.user as any)?._id;
      const { amount, paymentMethod } = req.body;
      
      if (!studentId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

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
      const transactionId = 'WALLET-' + Date.now();
      wallet.transactions.push({
        type: 'credit',
        amount,
        description: 'Wallet recharge',
        referenceId: transactionId,
        referenceType: 'wallet_recharge',
        createdAt: new Date()
      });

      // Update balance
      wallet.balance += amount;
      wallet.lastUpdated = new Date();
      await wallet.save();

      return res.status(200).json({
        message: 'Funds added successfully',
        newBalance: wallet.balance,
        transactionId
      });
    } catch (error) {
      console.error('Add funds error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
