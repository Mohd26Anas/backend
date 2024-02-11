import mongoose from "mongoose";
import { Subscription } from "../models/subscription.modal.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";

const subscribed = asynHandler(async (req, res) => {
  const { channelId, userId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(channelId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid channelId or userId format"));
  }

  try {
    const subscription = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Subscription created successfully",
        subscription
      )
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

export { subscribed };
