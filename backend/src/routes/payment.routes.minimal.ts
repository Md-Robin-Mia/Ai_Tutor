import * as express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Student payment routes
router.post('/purchase-course', authenticate, PaymentController.purchaseCourse);
router.get('/purchase-history', authenticate, PaymentController.getPurchaseHistory);
router.get('/transaction/:transactionId', authenticate, PaymentController.getTransactionDetails);
router.post('/request-refund', authenticate, PaymentController.requestRefund);

export default router;
