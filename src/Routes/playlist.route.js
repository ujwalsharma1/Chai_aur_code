import Router from "express"
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../Controllers/playlist.controller.js";

const router = Router();

router.use(verifyjwt);

router.route("/").post(createPlaylist);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/:playlistId").delete(deletePlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/update/:playlistId").patch(updatePlaylist);



export default router