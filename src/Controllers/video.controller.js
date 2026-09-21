import { Video } from "../Models/video.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  // fetch data from req.body

  const { title, description } = req.body;

  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  // validate required things from data

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "videoFile or thumbnail missing");
  }

  // upload video to cloudinary and get url

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // check if url came or not

  if (!videoFile) {
    throw new ApiError(400, "videoFile is required");
  }

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail is required");
  }

  // make a video doucment and store all things

  const videoUploaded = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  if (!videoUploaded) {
    throw new ApiError(500, "Some error came while publishing the video");
  }
  // return a response

  return res
    .status(201)
    .json(new ApiResponse(201, "video published successfully", videoUploaded));
});

const getAllVideos = asyncHandler(async (req, res) => {
  // find all published videos

  const videos = await Video.find({ isPublished: true });

  if (!videos) {
    throw new ApiError(400, "something went wrong while getting all videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Fetched all Videos", videos));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const videoFounded = await Video.findOne({ _id: videoId });

  if (!videoFounded) {
    throw new ApiError(400, "Unable to fetch the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Fetched successfully", videoFounded));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const videoToDel = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!videoToDel) {
    throw new ApiError(404, "Video not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully", {}));
});

const togglePublish = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const fetchVideo = await Video.findById(videoId);

  if (!fetchVideo) {
    throw new ApiError(404, "Video do not exist or you are not authorized");
  }

  fetchVideo.isPublished = !fetchVideo.isPublished;

  await fetchVideo.save();
  
  return res
    .status(200)
    .json(new ApiResponse(200, "Publish Toggled Successfully", fetchVideo));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description must be required");
  }

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { returnDocument: "after" }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video details updated successfully", video));
});

export {
  publishVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  togglePublish,
  updateVideoDetails,
};
