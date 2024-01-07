import mongoose, { Schema } from "mongoose";


const fileSchema = new Schema(
  {

    avatar: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);





export const File = mongoose.model("File", fileSchema);
