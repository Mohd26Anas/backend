import { Router } from "express";
import { uploadFileApi } from "../controllers/fileUpload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo } from "../controllers/fileUpload.controller.js";

const fileUploaderRoute = Router();

fileUploaderRoute.route("/upload").post(
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  uploadFileApi
);

fileUploaderRoute.route("/upload-video").post(
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default fileUploaderRoute;
