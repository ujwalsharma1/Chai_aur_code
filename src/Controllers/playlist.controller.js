import { Playlist } from "../Models/playlist.model.js";
import { Video } from "../Models/video.model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title or Description is required");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while creating playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist Id and video Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const checkVideo = await Video.findById(videoId);

  if (!checkVideo) {
    throw new ApiError(404, "Video not found");
  }

  const addVideo = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { returnDocument: "after" }
  );

  if (!addVideo) {
    throw new ApiError(404, "Playlist not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to playlist", addVideo));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlistId required");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlistDel = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlistDel) {
    throw new ApiError(404, "Playlist not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", {}));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (userPlaylists.length === 0) {
    throw new ApiError(
      500,
      "Something went wrong while fetching user playlists"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User's playlists fecthed successfully",
        userPlaylists
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist Fecthed", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist Id and video Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const checkVideo = await Video.findById(videoId);

  if (!checkVideo) {
    throw new ApiError(404, "Video not found");
  }

  const removeVideo = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      $pull: { videos: videoId },
    },
    { returnDocument: "after" }
  );

  if (!removeVideo) {
    throw new ApiError(404, "Playlist not found or you are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "video removed successfully", removeVideo));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { newname, newdescription } = req.body;

  if (!newname?.trim() || !newdescription?.trim()) {
    throw new ApiError(400, "name and description required");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    {
      name: newname,
      description: newdescription,
    },
    { returnDocument: "after" }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or you are unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist Updated", updatedPlaylist));
});

export {
  createPlaylist,
  addVideoToPlaylist,
  deletePlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
};
