import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    comment: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    post: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    likedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
