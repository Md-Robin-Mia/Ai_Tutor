import express from 'express';
import { getCareerAdvice, submitProject, getCertificates } from '../controllers/career.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/advice', authenticate, getCareerAdvice);
router.post('/projects', authenticate, submitProject);
router.get('/certificates', authenticate, getCertificates);

export default router;
