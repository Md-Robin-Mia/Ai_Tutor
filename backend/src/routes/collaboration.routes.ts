import express from 'express';
import { createStudyGroup, joinGroup, getGroups, sendMessage, getGroupDetails, getMessages, leaveGroup } from '../controllers/collaboration.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/groups', authenticate, createStudyGroup);
router.post('/groups/:groupId/join', authenticate, joinGroup);
router.post('/groups/:groupId/leave', authenticate, leaveGroup);
router.get('/groups', authenticate, getGroups);
router.get('/groups/:groupId', authenticate, getGroupDetails);
router.get('/groups/:groupId/messages', authenticate, getMessages);
router.post('/groups/:groupId/messages', authenticate, sendMessage);

export default router;
