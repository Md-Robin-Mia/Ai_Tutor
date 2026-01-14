import express from 'express';
import { createQuiz, getQuiz, submitQuiz, getAttempts } from '../controllers/quiz.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createQuiz);
router.get('/:quizId', authenticate, getQuiz);
router.post('/:quizId/submit', authenticate, submitQuiz);
router.get('/attempts/history', authenticate, getAttempts);

export default router;
