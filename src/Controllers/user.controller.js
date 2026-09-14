import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

// method to generate access , refresh token

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(500, "Generate token error 1");
    }

    const accessToken = user.generateAccessToken(); // call methods defined in model of User
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // store refreshtoken in db in user.refreshtoken field
    await user.save({ validateBeforeSave: false }); // dont validate on this save ..

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Generate token error 2");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // fetch data from req.body

  const { fullName, email, username, password } = req.body;

  // validate the data - not empty

  if (
    [fullName, email, username, password].some((fields) => {
      if (fields === "") return true;
    })
  ) {
    throw new ApiError(400, "All fields are required ");
  }

  // validate if user already exists

  const checkIfUserExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (checkIfUserExists) {
    throw new ApiError(409, "User already exists");
  }
  // store the files on local server

  //const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  var avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  var coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  // store the files on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // create new user with User model

  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // || is for check if cover image is there or not because it is not compulsory
    username: username.toLowerCase(),
    password,
    email,
  });

  // check for user created

  const createUserCheck = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createUserCheck) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // send the final response - remove pass , refreshtoken field

  return res
    .status(201)
    .json(
      new ApiResponse(200, createUserCheck, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from req.body

  const { email, username, password } = req.body;

  // validate data from user

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }

  // validate if user exists or not

  const checkUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!checkUser) {
    throw new ApiError(404, "User is not registered");
  }

  // validate email and password

  const passCheck = await checkUser.isPasswordCorrect(password); // when you are accessing your own declared methods , you can't use User model of mongoDb , use your own user object

  if (!passCheck) {
    throw new ApiError(401, "Wrong Password");
  }

  // generate access , refresh tokens

  const { accessToken, refreshToken } = await generateTokens(checkUser._id);

  const loggedInUser = await User.findById(checkUser._id).select(
    "-password -refreshToken"
  ); // this is written because in previous checkUser object , we fetched every field including pass , tokens .. so to send as a response we called one more time with only req fields

  // send cookie

  const options = {
    // this means that cookie can be modified only by server , not on frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
  // send it as response
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    // this means that cookie can be modified only by server , not on frontend
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));

  // remove tokens , cookies
  // clear refreshToken field from USer model in db
});

export { registerUser, loginUser, logoutUser };
