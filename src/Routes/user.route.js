import Router from "express";
import { changeCurrentPassword, 
    getChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
} from "../Controllers/user.controller.js";

import {upload} from "../Middlewares/multer.middleware.js"
import { verifyjwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

    router.route("/login").post(loginUser)

    // secured routes

    router.route("/logout").post(verifyjwt , logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-pass").post(verifyjwt , changeCurrentPassword)
    router.route("/update-details").patch(verifyjwt , updateAccountDetails)
    router.route("/avatar").patch(verifyjwt , upload.single("avatar") , updateUserAvatar)
    router.route("/coverImage").patch(verifyjwt , upload.single("coverImage") , updateUserCoverImage)

    router.route("/c/:username").get(verifyjwt , getChannelProfile);
    router.route("/watch-history").get(verifyjwt , getWatchHistory);

export default router;
