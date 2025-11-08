import { Router } from "express";
import { commentRoutes } from "./comment.routes.js";
import { voteRoutes } from "./vote.routes.js";
import { authRoutes } from "./auth.routes.js";
import { userRoutes } from "./user.routes.js";
import { movieRoutes } from "./movie.routes.js";
import { favoriteRoutes } from "./favorite.routes.js";
import { communityTopRoutes } from "./community-top.routes.js";
import { myListRoutes } from "./my-list.routes.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/movies", authenticate, movieRoutes);
router.use("/comments", authenticate, commentRoutes);
router.use("/votes", authenticate, voteRoutes);
router.use("/users", authenticate, userRoutes);
router.use("/favorites", authenticate, favoriteRoutes);
router.use("/community-top", authenticate, communityTopRoutes);
router.use("/my-list", authenticate, myListRoutes);

export { router as apiRoutes };
