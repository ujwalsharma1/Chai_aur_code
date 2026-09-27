import { WatchHistory } from "../Models/watchHistory.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { Video } from "../Models/video.model.js";

const updateWatchHistory = asyncHandler(async (req, res) => {
  const { videoId, watchedDuration } = req.body;

  if (!videoId || watchedDuration === undefined) {
    throw new ApiError(400, "videoId and watchedDuration required");
  }

  if (watchedDuration < 0) {
    throw new ApiError(400, "Invalid watch duration");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video Id is invalid");
  }

  const videoExists = await Video.exists({ _id: videoId });
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const watchHistory = await WatchHistory.findOneAndUpdate(
    {
      video: videoId,
      user: req.user?._id,
    },
    {
      watchedDuration: Math.max(
        watchedDuration,
        existing?.watchedDuration || 0
      ),
      lastWatchedAt: new Date(),
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Watch History Updated", watchHistory));
});

const getResumePoint = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video Id is invalid");
  }

  const history = await WatchHistory.findOne({
    video: videoId,
    user: req.user?._id,
  });

  return res.status(200).json(
    new ApiResponse(200, "Resume point fetched", {
      resumeFrom: history?.watchedDuration || 0,
    })
  );
});

const getWatchHistoryList = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const history = await WatchHistory.find({
    user: userId,
  })
    .populate("video")
    .sort({ lastWatchedAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "watch history fetched", history));
});

export { updateWatchHistory, getResumePoint, getWatchHistoryList };
