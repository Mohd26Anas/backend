import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { asynHandler } from "../utils/asynHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addLike = asynHandler(async (req, res) => {
  const { contentId, contentType } = req.body;
  const userId = req.user?._id;
  if (!mongoose.Types.ObjectId.isValid(contentId) && !contentId) {
    return res.status(400).json(new ApiResponse(400, "Object id is required"));
  }

  const existLike = await Like.findOne({
    likedBy: userId,
    contentId,
    contentType,
  });

  if (existLike) {
    await Like.findByIdAndDelete(existLike._id);
    return res.status(200).json(new ApiResponse(200, "Like removed"));
  }

  try {
    const like = await Like.create({
      contentId,
      likedBy: userId,
      contentType,
    });

    return res.status(200).json(new ApiResponse(200, "Like added", like));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

export { addLike };
