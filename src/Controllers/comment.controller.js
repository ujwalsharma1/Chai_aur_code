import { Comment } from "../Models/comment.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../Utils/ApiError.js";
import { Video } from "../Models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is invalid");
  }

  const checkVideo = await Video.exists({ _id: videoId });

  if (!checkVideo) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    video: videoId,
    content: content.trim(),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "comment id is invalid");
  }

  const commentdel = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!commentdel) {
    throw new ApiError(404, "Comment not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", []));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "comment id is invalid");
  }
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
    },
    {
      content: content.trim(),
    },
    {
      returnDocument: "after",
    }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video id is invalid");
  }

  const checkVideo = await Video.exists({ _id: videoId });

  if (!checkVideo) {
    throw new ApiError(404, "Video not found");
  }

  const getComments = await Comment.find({
    video: videoId,
  }).lean().sort({ createdAt: -1 });

  if (getComments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No comments on video", getComments));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video Comments fetched successfully", getComments)
    );
});

export { addComment, deleteComment, updateComment, getVideoComments };
