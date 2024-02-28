import mongoose, { model } from "mongoose";
import { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export const tweets = mongoose.model("tweets", tweetSchema);
