import { Subscription } from "../Models/subscription.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";


const toggleSubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channel Id is required");
  }

  // prevent self-subscription
  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const checkSubs = await Subscription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (checkSubs) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed successfully", {}));
  }

  const newSubs = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!newSubs) {
    throw new ApiError(500, "Error while subscribing channel");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "Subscribed successfully", newSubs));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
      },
    },
    {
      $unwind: "$channels",
    },
    {
      $replaceRoot: {
        newRoot: "$channels", //  bring channel fields to root
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
      },
    },
  ]);

  if (!subscribedChannels) {
    throw new ApiError(
      500,
      "Something went wrong while fetching subscribed channels"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribed Channels fetched successfully",
        subscribedChannels
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribersDetails",
      },
    },
    {
      $unwind: "$subscribersDetails",
    },
    {
      $replaceRoot: {
        newRoot: "$subscribersDetails",
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ]);

  if (userChannelSubscribers.length === 0) {
    throw new ApiError(
      500,
      "Something went wrong while fetching user subscribers"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribers Fetched successfully",
        userChannelSubscribers
      )
    );
});

export { toggleSubscribe, getSubscribedChannels, getUserChannelSubscribers };
