import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asynHandler.js";
import Jwt from "jsonwebtoken";

export const verifyJWT = asynHandler(async (req, _, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req?.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decode = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decode?._id).select(
      "-password -refreshToken"
    );
    // console.log(user,"auth");

    if (!user) {
      throw new ApiError(401, "Invalide token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access");
  }
});
