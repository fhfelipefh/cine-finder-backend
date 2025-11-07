import { Router, type Request, type Response } from "express";
import { VoteController } from "../controllers/vote.controller.js";
import { authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new VoteController();

router.get("/ranking", (req: Request, res: Response) =>
  controller.ranking(req, res)
);
router.get("/ranking/:imdbId", (req: Request, res: Response) =>
  controller.movieRanking(req, res)
);

router.get("/me", (req: Request, res: Response) =>
  controller.listMine(req, res)
);
router.post("/", (req: Request, res: Response) =>
  controller.upsert(req, res)
);
router.get("/by-id/:id", (req: Request, res: Response) =>
  controller.getById(req, res)
);
router.put("/by-id/:id", (req: Request, res: Response) =>
  controller.updateById(req, res)
);
router.delete(
  "/by-id/:id",
  authorizeAdmin,
  (req: Request, res: Response) => controller.remove(req, res)
);

export { router as voteRoutes };
