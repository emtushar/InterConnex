import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
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
postSchema.plugin(mongooseAggregatePaginate);
export const Post = mongoose.model("Post", postSchema);
