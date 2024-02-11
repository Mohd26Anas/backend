import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAndAccessToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asynHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  const avatarImage = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarImage) {
    throw new ApiError(400, "Please upload an avatar image");
  }

  const avatar = await uploadFile(avatarImage);
  const cover = await uploadFile(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: cover?.url || "",
    password,
    username: username.toLowerCase(),
  });

  const creatingUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!creatingUser) {
    throw new ApiError(400, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, creatingUser, "User created successfully"));
});

const login = asynHandler(async (req, res) => {
  console.log(req.body);

  const { email, username, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, { email, password }, "User not found"));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user?._id
  );

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  const options = {
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
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logOut = asynHandler(async (req, res) => {
  console.log(req.user);
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshToken = asynHandler(async (req, res) => {
  const incomingRefreshToken =
    req?.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user?._id
    );

    const options = {
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
          { accessToken, refreshToken },
          "Refresh token created successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const changepassword = asynHandler(async (req, res) => {
  const { oldPassword, newPassword, conPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }
  if (newPassword !== conPassword) {
    throw new ApiError(400, "Passwords do not match");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const currentUser = asynHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user));
});

const updateDetails = asynHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName) {
    throw res.status(400).json(new ApiResponse(400, "All fields are required"));
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Details updated successfully", user));
});

const getUserChaneel = asynHandler(async (req, res) => {
  const { username } = req.params;

  console.log(username);

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subsriberCount: {
          $size: "$subscribers",
        },
        channelCount: {
          $size: "$subscribedTo",
        },
        isSubscribe: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        coverImage: 1,
        avatar: 1,
        subsriberCount: 1,
        channelCount: 1,
        isSubscribe: 1,
        email: 1,
      },
    },
  ]);

  // console.log(await channel.explain("executionStats"));

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Channel found successfully", channel[0]));
});

const usersData = asynHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
      return res.json(new ApiResponse(404, "User not found"));
    }

    return res.json(new ApiResponse(200, "Data fetch successful", user));
  } catch (error) {
    // Handle errors, log them, and send an appropriate response
    console.error(error);
    return res.json(new ApiResponse(500, "Internal Server Error"));
  }
});

const watchHistory = asynHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    avatar: 1,
                    fullName: 1,
                    username: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Data fetch successful"));
});

const updateWatchHistory = asynHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { watchHistory: videoId } },
    { new: true }
  );
  res.status(200).json(new ApiResponse(200, "Video added to watch history"));
});

export {
  registerUser,
  login,
  logOut,
  refreshToken,
  changepassword,
  updateDetails,
  currentUser,
  getUserChaneel,
  usersData,
  watchHistory,
  updateWatchHistory,
};
