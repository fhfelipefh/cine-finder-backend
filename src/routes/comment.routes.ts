import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';

const router = Router();
const controller = new CommentController();

router.get('/:imdbId', (req, res) => controller.listByImdb(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.remove(req, res));

export { router as commentRoutes };
