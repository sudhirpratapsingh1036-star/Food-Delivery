import { Router } from "express";
import multer from "multer";
import {
  getAllVideos,
  publishAVideo,
  updateVideo,
  deleteVideo,
  getOwnerVideos
} from "../controllers/video.controller.js";
import { verifyOwnerJWT } from "../middlewares/authOwner.middleware.js";


const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/feed", getAllVideos);


router.post("/upload", verifyOwnerJWT, upload.single("video"), publishAVideo);
router.get("/ownervideos", verifyOwnerJWT, getOwnerVideos);
router.put("/:videoId", verifyOwnerJWT, updateVideo);
router.delete("/:videoId", verifyOwnerJWT, deleteVideo);

export default router;
