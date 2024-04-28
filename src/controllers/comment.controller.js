import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";

const createComment = asyncHandler(async (req, res) => {
  // get content ofcomment from body
  // check for non empty
  // create comment
  //   check for creation
  // response created comment with success
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Comment is required");
  }
  const createdComment = await Comment.create({
    content,
    owner: req.user?._id,
  });

  if (!createdComment) {
    throw new ApiError(500, "failed to comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment created successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // get comment id from params
  // find comment and match comment owner with req.user
  // if matches delete the comment
  // response success
  const { commentId } = req.params;
  const foundedComment = await Comment.findById(commentId);
  if (!foundedComment) {
    throw new ApiError(400, "Comment does not exist with this id");
  }
  if (foundedComment.owner !== req.user?._id) {
    throw new ApiError(400, "Invalid request");
  }
  await Comment.findByIdAndDelete(deleteComment._id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deleted Comment successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // get comment id which needs to be updated
  //   get updated content from body
  //   check for non empty
  //   check comment owner with req.user
  //   response success updated comment
  const { commentId } = req.params;
  const { updatedContent } = req.body;
  if (!updatedContent) {
    throw new ApiError(400, "Update Content is required to update the comment");
  }
  const oldComment = await Comment.findById(commentId);
  if (oldComment.owner !== req.user?._id) {
    throw new ApiError(400, "Invalid request");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    oldComment._id,
    {
      content: updatedContent,
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "failed to update comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment is updated successfully")
    );
});

const getComment = asyncHandler(async (req, res) => {
  // get commentId from params
  // find comment
  // return success
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment does not exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment fetched successfully"));
});

const toggleCommmentLike = asyncHandler(async (req, res) => {
  // get commentid from params
  // find like model from req.user
  // if like model
  const { commentId } = req.params;
  const userLike = await Like.findOne({ likedBy: req.user?._id }).select(
    "-post"
  );
  if (!userLike) {
    const likedUser = await Like.create({
      $push: { comment: commentId },
      likedBy: req.user?._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, likedUser, "Comment liked successfully"));
  }
  if (!userLike.comment.includes(commentId)) {
    userLike?.comment.push(commentId);
    userLike.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, userLike, "Comment liked successfully"));
  }
  const unlikedUser = await Like.findByIdAndUpdate(
    userLike?._id,
    {
      $pull: { comment: commentId },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, unlikedUser, "comment unliked successfully"));
});

export {
  createComment,
  deleteComment,
  updateComment,
  getComment,
  toggleCommmentLike,
};
