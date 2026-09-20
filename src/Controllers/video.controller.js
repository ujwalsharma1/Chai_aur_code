import { Video } from "../Models/video.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";

const publishVideo = asyncHandler(async (req,res)=> {

    // fetch data from req.body

    const { title , description } = req.body

    if(!title.trim() || !description.trim()){
        throw new ApiError(400 , "All fields are required");
    }

    // validate required things from data

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError(400 , "videoFile or thumbnail missing")
    }

    // upload video to cloudinary and get url 

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // check if url came or not

    if(!videoFile){
        throw new ApiError(400 , "videoFile is required");
    }

    if(!thumbnail){
        throw new ApiError(400 , "thumbnail is required");
    }

    // make a video doucment and store all things

    const videoUploaded = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if(!videoUploaded){
        throw new ApiError(500 , "Some error came while publishing the video")
    }
    // return a response 

    return res.status(201)
    .json(
        new ApiResponse(201 , "video published successfully" , videoUploaded)
    )

})

const getAllVideos = asyncHandler(async (req, res) => {
    // find all published videos

    const videos = await Video.find({isPublished: true})

    if(!videos){
        throw new ApiError(400 , "something went wrong while getting all videos")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , "Fetched all Videos" , videos)
    )
})

const getVideoById = asyncHandler(async (req,res)=> {

    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(400 , "Video Id is required");
    }

    const videoFounded = await Video.findOne({_id : videoId});

    if(!videoFounded){
        throw new ApiError(400 , "Unable to fetch the video");
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , "Video Fetched successfully" , videoFounded)
    )
})

const deleteVideo = asyncHandler( async(req,res) => {

    const {videoId} = req.body

    if(!videoId){
        throw new ApiError(400 , "Video id is required");
    }

    const videoToDel = await Video.findById(videoId);

    if(!videoToDel){
        throw new ApiError(404 , "Video not found")
    }

    if(!videoToDel.owner.equals(req.user?._id)){
        throw new ApiError(403 , "You are not authorized to delete this video");
    }

    await videoToDel.deleteOne();

    return res.status(200)
    .json(
        new ApiResponse(200 , "Video Deleted Successfully" , {})
    )

})


export { publishVideo , getAllVideos , getVideoById , deleteVideo}