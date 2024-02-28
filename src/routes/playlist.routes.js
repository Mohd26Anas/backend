import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

playlistRouter.post("/create", verifyJWT, createPlaylist);
playlistRouter.put(
  "/add-video/:playlistId/:videoId",
  verifyJWT,
  addVideoToPlaylist
);
playlistRouter.put(
  "/remove-video/:playlistId/:videoId",
  verifyJWT,
  removeVideoFromPlaylist
);
playlistRouter.get("/user-playlist/:userId", verifyJWT, getUserPlaylists);
playlistRouter.get("/videos/:playlistId", verifyJWT, getPlaylistById);
playlistRouter.delete("/delete/:playlistId", verifyJWT, deletePlaylist);
playlistRouter.patch("/update/:playlistId", verifyJWT, updatePlaylist);
export default playlistRouter;
