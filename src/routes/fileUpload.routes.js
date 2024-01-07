
import { Router } from "express";
import { uploadFileApi } from "../controllers/fileUpload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const fileUploaderRoute = Router();


fileUploaderRoute.route("/upload").post(  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
   
]),uploadFileApi);



export default fileUploaderRoute;

