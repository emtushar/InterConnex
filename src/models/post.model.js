import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    mediaFile: {
      type: String, //cloudinary url
    },
    caption: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
