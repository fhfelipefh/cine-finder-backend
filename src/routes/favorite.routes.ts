import { Router, type Request, type Response } from "express";
import { FavoriteController } from "../controllers/favorite.controller.js";

const router = Router();
const controller = new FavoriteController();

router.get("/", (req: Request, res: Response) => controller.list(req, res));
router.post("/", (req: Request, res: Response) => controller.add(req, res));
router.put("/:imdbId", (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:imdbId", (req: Request, res: Response) =>
  controller.remove(req, res)
);

export { router as favoriteRoutes };
