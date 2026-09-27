import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import {
  getResumePoint,
  updateWatchHistory,
  getWatchHistoryList,
} from "../Controllers/watchHistory.controller.js";

const router = Router();

router.use(verifyjwt);

router.route("/").post(updateWatchHistory).get(getWatchHistoryList);
router.route("/:videoId").get(getResumePoint);

export default router;
