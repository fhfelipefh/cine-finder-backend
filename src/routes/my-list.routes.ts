import { Router, type Request, type Response } from "express";
import { MyListController } from "../controllers/my-list.controller.js";

const router = Router();
const controller = new MyListController();

router.get("/stats", (req: Request, res: Response) =>
  controller.stats(req, res)
);
router.get("/", (req: Request, res: Response) => controller.list(req, res));
router.get("/:id", (req: Request, res: Response) => controller.getOne(req, res));
router.post("/", (req: Request, res: Response) =>
  controller.createOrUpdate(req, res)
);
router.put("/:id", (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", (req: Request, res: Response) =>
  controller.remove(req, res)
);

export { router as myListRoutes };
