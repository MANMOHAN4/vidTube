import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Without fetching the entire video from MongoDB,
  // I only need to check whether a video with videoId exists in the DB or not.

  const videoExists = await Video.exists({ _id: videoId });

  if (!videoExists) {
    throw new ApiError(400, "Video not found");
  }

  // Creating a comment in DB
  try {
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user?._id, // the one who comments on video
    });

    const createdComment = await Comment.findById(comment?._id);

    // Fetching the comment from DB using id
    if (!createdComment) {
      throw new ApiError(500, "Something went wrong while commenting");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdComment, "Commented successfully"));
  } catch (error) {
    console.log("Not Commented");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment-Id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  // Validate that the current user is the one who commented on video.
  if (!comment?.owner.equals(req.user?._id)) {
    throw new ApiError(400, "You are not allowed to edit this comment");
  }
  console.log(1);

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Update the comment.
  comment.content = content;

  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Updated the comment successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
