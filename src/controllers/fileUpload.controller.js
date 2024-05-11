import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";
import { v2 as cloudinary } from "cloudinary";

const uploadFileApi = asynHandler(async (req, res) => {
  const image = await uploadFile(req.files?.file[0]?.path);

  if (!image?.url) {
    throw new ApiError(400, "File not uploaded");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, image, "File uploaded successfully"));
});

export { uploadFileApi };
