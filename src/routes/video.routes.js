import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getVideoById,
  togglePublished,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controllers.js";

const videoRouter = Router();

videoRouter.route("/upload").post(
  verifyJWT,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "videoFile",
      maxCount: 1,
    },
  ]),

  uploadVideo
);
videoRouter
  .route("/toggle-pushlished/:videoId")
  .patch(verifyJWT, togglePublished);
videoRouter.route("/get-video/:videoId").get(verifyJWT, getVideoById);
videoRouter
  .route("/update-video/:videoId")
  .patch(
    verifyJWT,
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    updateVideo
  );
videoRouter.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);

export default videoRouter;
