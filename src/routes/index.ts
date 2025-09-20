import { Router } from 'express';
import { commentRoutes } from './comment.routes.js';

const router = Router();

router.use('/comments', commentRoutes);

export { router as apiRoutes };