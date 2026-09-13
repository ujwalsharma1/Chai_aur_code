import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

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

const loginUser = asyncHandler( async(req,res) => {
  // get data from req.body
  // validate data from user 
  // validate if user exists or not
  // validate email and password
  // generate access , refresh tokens 
  // send cookie
  // send it as response
})

export { registerUser , loginUser };
