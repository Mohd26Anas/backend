import { upload } from "../middlewares/multer.middleware.js";
import { Video } from "../models/video.modal.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";

const uploadVideo = asynHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiResponse(400, "All fields are required");
  }

  const image = req.files?.image[0]?.path;
  if (!image) {
    throw new ApiError(400, "Please upload an thumbnail image");
  }

  const thumbnail = await uploadFile(image);
  const videoFile = req?.files?.videoFile[0]?.path;
  if (!videoFile) {
    throw new ApiError(400, "Please upload an video image");
  }
  const videoUrl = await uploadFile(videoFile);
  console.log(videoUrl);

  const video = await Video.create({
    videoFile: videoUrl?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videoUrl?.duration,
    owner: req?.user?._id,
  });

  res.json(new ApiResponse(200, "Video uploaded successfully", video));
});

const togglePublished = asynHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiResponse(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    const updateDetails = await video.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Video updated successfully", updateDetails));
  } catch (error) {
    console.error(error);
  }
});

const getVideoById = asynHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiResponse(404, "Video not found");
  }

  res.status(200).json(new ApiResponse(200, "Video found successfully", video));
});

const updateVideo = asynHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;
  let thumbnail;
  if (req?.files?.thumbnail?.length > 0) {
    const image = req?.files?.thumbnail[0]?.path;
    console.log(image);

    const th = uploadFile(image);
    thumbnail = th?.url;
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: { title, description, thumbnail } },
    { new: true }
  );

  if (!video) {
    throw res.json(new ApiResponse(404, "Video not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asynHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiResponse(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", video));
});

export { uploadVideo, togglePublished, getVideoById, updateVideo, deleteVideo };
