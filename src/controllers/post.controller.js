import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

const createPost = asyncHandler(async (req, res) => {
  // get user from req.user
  // get post details like mediafile ,caption from body
  // check for non-empty fields
  // upload media on cloudinary
  // create post
  // check for creation of post
  // return created post

  const { caption } = req.body;
  const mediaLocalFilePath = req.file?.path;

  if (!mediaLocalFilePath) {
    throw new ApiError(400, "Media File is required");
  }

  const mediaFile = await uploadOnCloudinary(mediaLocalFilePath);

  if (!mediaFile?.url) {
    throw new ApiError(500, "Failed to upload media on cloudinary,try again");
  }

  const createdPost = await Post.create({
    caption,
    mediaFile: mediaFile.url,
    owner: req.user?._id,
  });

  if (!createdPost) {
    throw new ApiError(500, "Failed to post");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdPost, "Post creted successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  // get post id from params
  // check if the post owner is same as request owner
  // delte post
  // return reponse
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(400, "Post does not exist");
  }

  //   if (post.owner.toString() !== req.user?._id.toString()) {
  //     throw new ApiError(401, "Invalid request");
  //   }
  if (!post.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Invalid request");
  }
  await Post.findByIdAndDelete(post._id);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Post deleted successfully"));
});

const updateCaption = asyncHandler(async (req, res) => {
  // get postid by params
  // get caption by body
  // check for non-empty caption
  // find post by postid
  // check if post owner is same as current user
  const { postId } = req.params;
  const { caption } = req.body;
  if (!caption) {
    throw new ApiError(400, "caption is required ");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(400, "Invalid Post");
  }
  if (!post.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Invalid Request");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: { caption },
    },
    { new: true }
  );
  if (!updatedPost) {
    throw new ApiError(500, "failed to update caption");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, updatedPost, "Caption updated successfully"));
});

const getPostDetails = asyncHandler(async (req, res) => {
  // get postid from params
  //find post
  //   error if not found
  // return post
  const { postId } = req.params;

  const postDetails = await Post.findById(postId);
  if (!postDetails) {
    throw new ApiError(401, "Can't find post");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, postDetails, "Post details fetched successfully")
    );
});

const getAllPosts = asyncHandler(async (req, res) => {
  // getcurrent user find all its posts
});

export { createPost, deletePost, updateCaption, getPostDetails, getAllPosts };
