import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import Like from "../models/like.model.js";
import mongoose from "mongoose";
const createPost = asyncHandler(async (req, res) => {
  // get user from req.user
  // get post details like mediafile ,caption from body
  // check for non-empty fields
  // upload media on cloudinary
  // create post
  // check for creation of post
  // return created post

  const { caption } = req.body;
  let mediaLocalFilePath;
  if (req.file) {
    mediaLocalFilePath = req.file?.path;
  }
  // const mediaLocalFilePath = req.file?.path;

  // if (!mediaLocalFilePath) {
  //   throw new ApiError(400, "Media File is required");
  // }

  const mediaFile = await uploadOnCloudinary(mediaLocalFilePath);
  console.log(mediaFile?.url);
  // if (!mediaFile?.url) {
  //   throw new ApiError(500, "Failed to upload media on cloudinary,try again");
  // }

  const createdPost = await Post.create({
    caption,
    mediaFile: mediaFile?.url || "",
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
  s;
});

const getAllPosts = asyncHandler(async (req, res) => {
  // getcurrent user find all its posts
  // const { page = 1, limit = 5, query, sortBy = 1, sortType } = req.query;
  // console.log(query);
  // const options = {
  //   page: parseInt(page),
  //   limit: parseInt(limit),
  //   sort: { [sortBy]: parseInt(sortType) },
  // };

  const options = {
    page: 1,
    limit: 20,
  };
  // {
  //   $sort: options.sort,
  // },

  const aggregateOptions = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
  ];
  try {
    await Post.aggregatePaginate(
      aggregateOptions,
      options,
      function (err, results) {
        if (err) {
          throw new ApiError(500, "Failed to get post");
        } else {
          // console.log(results);
          return res
            .status(200)
            .json(new ApiResponse(200, results, "Posts fetched successfully"));
        }
      }
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const toggleLikePost = asyncHandler(async (req, res) => {
  // get post id by parmas
  // find owner
  // if does not exists then push
  // if exists check
  const { postId } = req.params;
  const userLike = await Like.findOne({ likedBy: req.user?._id }).select(
    "-comment"
  );

  if (!userLike) {
    const postLiked = await Like.create({
      $push: { post: postId },
      likedBy: req.user?._id,
    }).select("-comment");

    return res
      .status(200)
      .json(new ApiResponse(200, postLiked, "Liked post successfully"));
  }

  if (!userLike?.post.includes(postId)) {
    userLike?.post.push(postId);
    userLike.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, userLike, "Liked post successfully"));
  }

  const unlikedPost = await Like.findByIdAndUpdate(
    userLike?._id,
    {
      $pull: { post: postId },
    },
    { new: true }
  ).select("-comment");

  return res
    .status(200)
    .json(new ApiResponse(200, unlikedPost, "Post unliked successfully"));
});

export {
  createPost,
  deletePost,
  updateCaption,
  getPostDetails,
  getAllPosts,
  toggleLikePost,
};
