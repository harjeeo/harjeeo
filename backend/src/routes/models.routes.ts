import { Router } from 'express';
import { listEnabledModels } from '../controllers/models.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listEnabledModels);

export default router;
