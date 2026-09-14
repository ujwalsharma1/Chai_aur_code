import jwt from "jsonwebtoken";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/ApiError.js";

export const verifyjwt = asyncHandler(async (req, res, next) => {
  try {
    const atoken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // so here as we have used cookieparser and sent res.cookie in registering user , we can access it here , if user sends a custom header as auth bearer then we can access it by 2nd method written after ||
    if (!atoken) {
      throw new ApiError(401 , "Unauthorized access");
    }

    const decodedToken = jwt.verify(atoken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
