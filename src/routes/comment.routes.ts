import { Router, type Request, type Response } from 'express';
import { CommentController } from '../controllers/comment.controller.js';

const router = Router();
const controller = new CommentController();

router.get('/:imdbId', (req: Request, res: Response) => controller.listByImdb(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export { router as commentRoutes };
