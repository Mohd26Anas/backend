import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    contentType: {
      type: String,
      enum: ["VIDEO", "COMMENT", "TWEET", "REPLY_COMMENT"],
      required: true,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
