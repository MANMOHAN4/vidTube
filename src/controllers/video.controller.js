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

  // populate the creator's essential data (Since, creators name and avatar is displayed below video)
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
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video-Id required");
  }

  // returns the document with only the owner attribute
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  // Authorization: Ensure the logged-in user is the owner of this video
  const isOwner = video?.owner.equals(req.user?._id);

  if (!isOwner) {
    throw new ApiError(401, "Only owner (creator) can update the video");
  }

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailLocalPath = req.file?.path;
  console.log(thumbnailLocalPath);

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is missing");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(
      400,
      "Something went wrong while uploading new thumbnail"
    );
  }

  // update the video
  video.title = title;
  video.description = description;
  video.thumbnail = thumbnail.url;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "Title, description and thumbnail of the video updated successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video-Id required");
  }

  // returns the document with only the owner attribute
  const video = await Video.findById(videoId, "owner");

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const isOwner = video?.owner.equals(req.user?._id);

  if (isOwner) {
    console.log("Owner");
  } else {
    console.log("Not owner");
  }

  // const deletedVideo = await Video.findByIdAndDelete(videoId, {
  //   projection: {
  //     title: 1,
  //     description: 1,
  //     views: 1,
  //     duration: 1,
  //   },
  // });
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
