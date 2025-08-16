import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // The below line is a clever and concise way to extract a JWT token from either:
  //   1. A cookie (typically used in web browsers), or
  //   2. The Authorization header (typically used in API clients like Postman or mobile apps)

  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); // ⚠️ There is a space after - Bearer (i.e "Bearer_")

  if (!token) {
    throw new ApiError(401, "Access Token not found");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unathorized");
  }
});
