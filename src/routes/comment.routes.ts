import { Router, type Request, type Response } from "express";
import { CommentController } from "../controllers/comment.controller.js";
import { authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new CommentController();

router.get("/admin/recent", authorizeAdmin, (req: Request, res: Response) =>
  controller.listRecent(req, res)
);
router.get("/:imdbId", (req: Request, res: Response) =>
  controller.listByImdb(req, res)
);
router.post("/", (req: Request, res: Response) =>
  controller.create(req, res)
);
router.put("/:id", (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", (req: Request, res: Response) =>
  controller.remove(req, res)
);

export { router as commentRoutes };
