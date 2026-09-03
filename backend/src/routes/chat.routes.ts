import { Router } from 'express';
import { getConversation, listConversations, sendMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.post('/send', sendMessage);

export default router;
