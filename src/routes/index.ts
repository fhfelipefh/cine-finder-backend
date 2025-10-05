import { Router } from 'express';
import { commentRoutes } from './comment.routes.js';
import { voteRoutes } from './vote.routes.js';

const router = Router();

router.use('/comments', commentRoutes);
router.use('/votes', voteRoutes);

export { router as apiRoutes };