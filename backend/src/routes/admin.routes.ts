import { Router } from 'express';
import { syncModels } from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.post('/models/sync', syncModels);

export default router;
