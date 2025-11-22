import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleLike } from "../controllers/like.controller.js";

const router = Router();

// Toggle like on a video
router.post("/toggle/:videoId", verifyJWT, toggleLike);

export default router;
