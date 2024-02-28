import mongoose from "mongoose";
import { asynHandler } from "../utils/asynHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.models.js";

const createPlaylist = asynHandler(async (req, res) => {
  const { name, description, videoId } = req.body;

  try {
    if (!name || !description || !videoId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Name and description are required"));
    }
    const playlist = await Playlist.create({
      name,
      description,
      videos: [videoId],
      owner: req?.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist created successfully", playlist));
  } catch (error) {
    throw new ApiResponse(500, "Internal Server Error");
  }
});

const getUserPlaylists = asynHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    if (!mongoose.isValidObjectId(userId) || !userId) {
      return res.status(400).json(new ApiResponse(400, "User id is not valid"));
    }
    const playlists = await Playlist.find({ owner: userId });

    if (playlists.length <= 0) {
      return res.status(404).json(new ApiResponse(404, "No playlist found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist found", playlists));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const getPlaylistById = asynHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    if (!mongoose.isValidObjectId(playlistId) || !playlistId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id is not valid"));
    }
    const playlist = await Playlist.find({ _id: playlistId });

    if (!playlist) {
      return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist found", playlist[0]?.videos));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const addVideoToPlaylist = asynHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  try {
    if (!playlistId || !videoId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id and video id are required"));
    }
    if (!mongoose.isValidObjectId(playlistId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id is not valid"));
    }
    if (!mongoose.isValidObjectId(videoId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Video id is not valid"));
    }
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: videoId } },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Video added to playlist successfully", playlist)
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const removeVideoFromPlaylist = asynHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  try {
    if (!playlistId || !videoId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id and video id are required"));
    }
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    );
    if (!playlist) {
      return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }
    if (!playlist.videos.includes(videoId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Video not found in playlist"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Video removed from playlist successfully",
          playlist
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }

  // TODO: remove video from playlist
});

const deletePlaylist = asynHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    if (!mongoose.isValidObjectId(playlistId) || !playlistId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id is not valid"));
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
      return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist deleted successfully", playlist));
  } catch (error) {
    console.log(error);
  }
});

const updatePlaylist = asynHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  try {
    if (!mongoose.isValidObjectId(playlistId) || !playlistId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist id is not valid"));
    }
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        name,
        description,
      },
      { new: true }
    );
    if (!playlist) {
      return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist updated", playlist));
  } catch (error) {
    console.log(error);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
