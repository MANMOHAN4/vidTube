import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description, isPublished } = req.body;

  /* "isPublished" field is note checked. Because it is defined as true in Schema. So, if the uploader wants to keep it private he can provide false. */

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video-File is missing");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Tumbnail is missing");
  }

  let videoFile;
  try {
    videoFile = await uploadOnCloudinary(videoFileLocalPath);
    console.log("Video File uploaded", videoFile);
  } catch (error) {
    console.log("Error uploading videoFile", error);
    throw new ApiError(500, "Failed to upload videoFile");
  }

  let thumbnail;
  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Thumbnail uploaded", thumbnail);
  } catch (error) {
    console.log("Error uploading thumbnail", error);
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // Creating a video in DB
  try {
    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      title,
      description,
      duration: videoFile.duration,
      owner: req.user?._id,
    });

    // Fetching the video from DB using id
    const createdVideo = await Video.findById(video._id);

    if (!createdVideo) {
      throw new ApiError(
        500,
        "Something went wrong while publishing the video"
      );
    }

    // else return the response
    return res
      .status(200)
      .json(new ApiResponse(200, createdVideo, "Video published successfully"));
  } catch (error) {
    // Data-base connection lost or something
    console.log("Video not published");

    if (videoFile) {
      await deleteFromCloudinary(videoFile.public_id);
    }

    if (thumbnail) {
      await deleteFromCloudinary(thumbnail.public_id);
    }
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "-password -email -refreshToken"
  );

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  console.log("Video views before: ", video.views);

  // Update the video views
  video.views += 1;
  await video.save();

  console.log("Video views after: ", video.views);

  const loggedInUser = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  // Update the watchHistory of the user who viewed the video
  loggedInUser.watchHistory.push(video?._id);
  await loggedInUser.save();
  console.log(loggedInUser.watchHistory);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
