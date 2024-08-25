import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { Like } from "../models/likes.model.js";

const getLikeOnComments = asynHandler(async (req, res) => {
  const { commentId } = req.params;

  try {
    if (!commentId || !mongoose.isValidObjectId(commentId)) {
      return res.status(400).json(new ApiResponse(400, "Invalid comment id"));
    }

    const likeData = await Like.aggregate([
      {
        $match: {
          contentId: new mongoose.Types.ObjectId(commentId),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "contentId",
          foreignField: "_id",
          as: "comment",
        },
      },
      {
        $unwind: "$comment",
      },
      {
        $group: {
          _id: "$comment._id",
          likeCount: { $sum: 1 },
          comment: { $first: "$comment" },
        },
      },
      {
        $project: {
          likeCount: 1,
        },
      },
    ]);

    if (likeData.length === 0) {
      return res.status(404).json(new ApiResponse(404, "Comments not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Comments found", likeData));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const addComment = asynHandler(async (req, res) => {
  try {
    const { content, videoId, comment } = req.body;
    if (!content || !videoId || !mongoose.isValidObjectId(videoId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid video id or content is required"));
    }
    const commentData = await Comment.create({
      content,
      comment,
      owner: req?.user?._id,
      video: videoId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment created successfully", commentData));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const updateComment = asynHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    if (!commentId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Comment id is required"));
    }
    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Comment id is not valid"));
    }
    if (!content) {
      return res.status(400).json(new ApiResponse(400, "Content is required"));
    }

    const findComment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        owner: req?.user?._id,
      },
      { content },
      { new: true }
    );

    if (!findComment) {
      return res.status(404).json(new ApiResponse(404, "Comment not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment updated", findComment));
  } catch (error) {
    console.error(error);

    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const deleteComment = asynHandler(async (req, res) => {
  const { commentId } = req.params;
  try {
    if (!mongoose.isValidObjectId(commentId) || !commentId) {
      res.status(400).json(new ApiResponse(400, "Comment id is not valid"));
    }
    const findComment = await Comment.findOneAndDelete({
      _id: commentId,
      owner: req?.user?._id,
    });
    if (!findComment) {
      return res.status(404).json(new ApiResponse(404, "Comment not found"));
    }
    return res.status(200).json(new ApiResponse(200, "Comment deleted"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

export { getLikeOnComments, addComment, updateComment, deleteComment };
