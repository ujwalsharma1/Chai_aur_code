import Router from "express"
import { verifyjwt } from "../Middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../Controllers/tweet.controller.js"

const router = Router()

router.use(verifyjwt)

router.route("/").post(createTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
router.route("/user/:userId").get(getUserTweets);

export default router