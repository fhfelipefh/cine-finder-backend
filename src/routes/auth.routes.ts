import { Router, type Request, type Response } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();
const controller = new AuthController();

router.post("/register", (req: Request, res: Response) =>
  controller.register(req, res)
);
router.post("/login", (req: Request, res: Response) =>
  controller.login(req, res)
);

export { router as authRoutes };
