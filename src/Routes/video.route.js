import Router from "express"
import {upload} from "../Middlewares/multer.middleware.js"
import { deleteVideo, getAllVideos, getVideoById, publishVideo } from "../Controllers/video.controller.js";
import {verifyjwt} from "../Middlewares/auth.middleware.js";

const router = Router()

// endpoints - // post a video , get all videos , get a particular video , delete your video , update video , toggle publish status

router.route("/publish").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    verifyjwt , 
    publishVideo);

    router.route("/all-videos").get(getAllVideos);
    router.route("/v/:videoId").get(getVideoById);
    router.route("/delete-video").delete(verifyjwt , deleteVideo);
    


export default router