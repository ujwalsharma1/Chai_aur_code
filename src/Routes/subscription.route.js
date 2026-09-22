import Router from "express";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscribe } from "../Controllers/subscription.controller.js";

const router = Router();

router.use(verifyjwt);

router.route("/subscribe/:channelId").post(toggleSubscribe);
router.route("/subscribed-channels").get(getSubscribedChannels);
router.route("/subscribers").get(getUserChannelSubscribers);

export default router;