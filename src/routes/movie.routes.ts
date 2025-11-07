import { Router, type Request, type Response } from "express";
import { MovieController } from "../controllers/movie.controller.js";
import { authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new MovieController();

router.get("/", (req: Request, res: Response) => controller.list(req, res));
router.post("/", (req: Request, res: Response) =>
  controller.create(req, res)
);
router.get("/imdb/:imdbId", (req: Request, res: Response) =>
  controller.getByImdb(req, res)
);
router.put("/:id", (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", authorizeAdmin, (req: Request, res: Response) =>
  controller.remove(req, res)
);

export { router as movieRoutes };
