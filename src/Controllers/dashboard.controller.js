import { User } from "../Models/user.model.js";
import { Video } from "../Models/video.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId  = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "userId is invalid");
  }

  const channelVideos = await Video.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  if (channelVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No videos available on this channel", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", channelVideos));
});

const getChannelStats = asyncHandler(async (req, res) => {
  // no. of subscribers , user have subscribed or not , username , avatar , coverImage
  const  userId  = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "userId is invalid");
  }

  const channelStats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
      },
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount : 1
      },
    },
  ]);

  if (channelStats.length === 0) {
    throw new ApiError(
      500,
      "Something went wrong while fetching channel stats"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Channel stats fetched", channelStats[0]));
});

export { getChannelVideos, getChannelStats };
