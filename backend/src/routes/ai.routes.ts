import express from 'express';
import { teach, generateQuiz, getMotivation, evaluateHandwriting, explainDiagram } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/teach', authenticate, teach);
router.post('/quiz/generate', authenticate, generateQuiz);
router.get('/motivation', authenticate, getMotivation);
router.post('/evaluate/handwriting', authenticate, evaluateHandwriting);
router.post('/explain/diagram', authenticate, explainDiagram);

export default router;
