import { Router } from 'express'
import { generateRevisionQuestion } from '../controllers/revision.controller'

const router = Router()

// POST /api/revision/generate-question
router.post('/generate-question', generateRevisionQuestion)

export default router
