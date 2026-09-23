import { Like } from "../Models/like.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tweet } from "../Models/tweet.model.js";
import { Comment } from "../Models/comment.model.js";
import { Video } from "../Models/video.model.js";

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "TweetId is invalid");
  }

  const tweetExists = await Tweet.exists({ _id: tweetId });
  if (!tweetExists) {
    throw new ApiError(404, "Tweet not found");
  }

  const checkLike = await Like.findOneAndDelete({
    tweet: tweetId,
    likeBy: req.user._id,
  });

  if (checkLike) {
    return res
      .status(200)
      .json(new ApiResponse(200, "like toggle successfull", {}));
  }

  const like = await Like.create({
    tweet: tweetId,
    likeBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "like toggle successfull", like));
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "VideoId is invalid");
  }

  const videoExists = await Video.exists({ _id: videoId });
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const checkLike = await Like.findOneAndDelete({
    video: videoId,
    likeBy: req.user._id,
  });

  if (checkLike) {
    return res
      .status(200)
      .json(new ApiResponse(200, "like toggle successfull", {}));
  }

  const like = await Like.create({
    video: videoId,
    likeBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "like toggle successfull", like));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "CommentId is invalid");
  }

  const commentExists = await Comment.exists({ _id: commentId });
  if (!commentExists) {
    throw new ApiError(404, "Comment not found");
  }

  const checkLike = await Like.findOneAndDelete({
    comment: commentId,
    likeBy: req.user._id,
  });

  if (checkLike) {
    return res
      .status(200)
      .json(new ApiResponse(200, "like toggle successfull", {}));
  }

  const like = await Like.create({
    comment: commentId,
    likeBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "like toggle successfull", like));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "userId is invalid");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likeBy: userId,
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
      },
    },
    {
      $unwind: "$likedVideos",
    },
    {
      $replaceRoot: {
        newRoot: "$likedVideos",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
      },
    },
  ]);

  if (likedVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No video is liked by user", likedVideos));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Like videos fetched", likedVideos));
});

export { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos };
