import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Creating a tweet in DB
  try {
    const tweet = await Tweet.create({
      content,
      owner: req.user?._id,
    });

    // Fetching the twee from DB
    const createdTweet = await Tweet.findById(tweet?._id);

    if (!createTweet) {
      throw new ApiError(500, "Something went wrong while creating the tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createTweet, "Tweet created successfully"));
  } catch (error) {
    // Data-base connection lost or something
    console.log("Tweet not created");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
