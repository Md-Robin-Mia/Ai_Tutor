import express from 'express';
import { register, login, googleAuth, googleCallback, getProfile, forgotPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/profile', authenticate, getProfile);

export default router;
