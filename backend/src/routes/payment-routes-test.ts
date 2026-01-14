import * as express from 'express';

const router = express.Router();

// Test route to verify payment routes are loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes are working!' });
});

// Simple purchase course route for testing
router.post('/purchase-course', (req, res) => {
  res.json({ message: 'Purchase course endpoint is working!' });
});

export default router;
