import * as express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { WithdrawalController } from '../controllers/withdrawal.controller';
import { AdminPaymentController } from '../controllers/adminPayment.controller';
import { StudentWalletController } from '../controllers/studentWallet.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = express.Router();

// Test route to verify payment routes are loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!' });
});

// Student payment routes
router.post('/purchase-course', authenticate, PaymentController.purchaseCourse);
router.get('/purchase-history', authenticate, PaymentController.getPurchaseHistory);
router.get('/transaction/:transactionId', authenticate, PaymentController.getTransactionDetails);
router.post('/request-refund', authenticate, PaymentController.requestRefund);

// Student wallet routes
router.get('/student/wallet', authenticate, StudentWalletController.getWalletInfo);
router.get('/student/purchase-history', authenticate, StudentWalletController.getPurchaseHistory);
router.get('/student/dashboard', authenticate, StudentWalletController.getDashboardSummary);
router.post('/student/wallet/add-funds', authenticate, StudentWalletController.addFunds);

// Teacher withdrawal routes
router.post('/withdrawal/request', authenticate, authorize(UserRole.TEACHER), WithdrawalController.requestWithdrawal);
router.get('/withdrawal/history', authenticate, authorize(UserRole.TEACHER), WithdrawalController.getWithdrawalHistory);
router.get('/teacher/wallet', authenticate, authorize(UserRole.TEACHER), WithdrawalController.getWalletInfo);
router.post('/withdrawal/cancel/:withdrawalId', authenticate, authorize(UserRole.TEACHER), WithdrawalController.cancelWithdrawal);
router.get('/teacher/earnings/summary', authenticate, authorize(UserRole.TEACHER), WithdrawalController.getEarningsSummary);

// Admin payment management routes
router.get('/admin/withdrawals', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.getAllWithdrawalRequests);
router.post('/admin/withdrawals/process', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.processWithdrawal);
router.get('/admin/analytics', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.getPaymentAnalytics);
router.get('/admin/transactions', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.getAllTransactions);
router.get('/admin/teacher-earnings', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.getTeacherEarningsOverview);
router.get('/admin/export', authenticate, authorize(UserRole.ADMIN), AdminPaymentController.exportPaymentData);

export default router;
