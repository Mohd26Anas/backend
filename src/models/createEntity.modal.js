import mongoose, { Schema } from "mongoose";

const createEntitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Entity = mongoose.model("Entity", createEntitySchema);
