import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Tweet } from "../Models/tweet.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "TweetId is invalid");
  }

  const delTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!delTweet) {
    throw new ApiError(404, "Tweet not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", {}));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user Id is required");
  }

  const tweets = await Tweet.find({ owner: userId });

  if (tweets.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No tweets found", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User tweets fecthed successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "TweetId is invalid");
  }

  const updatetweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id },
    {
      content: content,
    },
    { returnDocument: "after" }
  );

  if (!updatetweet) {
    throw new ApiError(404, "Tweet not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", updatetweet));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
