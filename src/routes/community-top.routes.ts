import { Router, type Request, type Response } from "express";
import { CommunityTopController } from "../controllers/community-top.controller.js";
import { authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new CommunityTopController();

router.get("/", (req: Request, res: Response) => controller.list(req, res));
router.put("/", authorizeAdmin, (req: Request, res: Response) =>
  controller.update(req, res)
);

export { router as communityTopRoutes };
