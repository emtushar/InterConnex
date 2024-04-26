import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    following: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
