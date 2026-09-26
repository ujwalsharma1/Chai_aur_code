import { Router } from 'express';
import { verifyjwt } from '../Middlewares/auth.middleware.js';
import { getChannelStats, getChannelVideos } from '../Controllers/dashboard.controller.js';

const router = Router()

router.use(verifyjwt)

router.route("/videos").get(getChannelVideos);
router.route("/stats").get(getChannelStats);

export default router