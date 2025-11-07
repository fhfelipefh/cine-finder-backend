import { Router, type Request, type Response } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router();
const controller = new UserController();

router.get("/me", (req: Request, res: Response) =>
  controller.getMe(req, res)
);
router.put("/me", (req: Request, res: Response) =>
  controller.updateMe(req, res)
);
router.put("/me/password", (req: Request, res: Response) =>
  controller.changePassword(req, res)
);
router.delete("/me", (req: Request, res: Response) =>
  controller.deleteMe(req, res)
);

export { router as userRoutes };
