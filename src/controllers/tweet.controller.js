import mongoose from "mongoose";
import { tweets } from "../models/tweets.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { asynHandler } from "../utils/asynHandler.js";
import cheerio from "cheerio";
import { JSDOM } from "jsdom";
import fs from "fs";

const createTweet = asynHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      throw res.json(new ApiResponse(400, "Content is required."));
    }

    const tweet = await tweets.create({
      owner: req?.user?._id,
      content,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet published successfully", tweet));
  } catch (error) {
    console.log(error);
  }
});

const getUserTweets = asynHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const allTweets = await tweets
      .find({ owner: userId })
      .populate("owner", "username fullName avatar");

    if (allTweets.length <= 0) {
      throw res.status(404).json(new ApiResponse(404, "No tweets found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweets fetched successfully", allTweets));
  } catch (error) {
    console.log(error);
  }
});
const getAllTweets = asynHandler(async (req, res) => {
  try {
    const sort = parseInt(req?.query?.sort) || -1;
    const page = parseInt(req?.query?.page) || 1;
    const pageSize = parseInt(req?.query?.pageSize) || 25;
    const searchKey = req?.query?.searchKey || null;
    const sortOwner = parseInt(req?.query?.sortOwner) || -1;

    console.log(searchKey);

    const skip = (page - 1) * pageSize;
    const searchQuery = searchKey
      ? {
          $or: [{ content: { $regex: new RegExp(searchKey, "i") } }],
        }
      : {};

    const allTweets = await tweets.aggregate([
      {
        $match: searchQuery,
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerInfo",
        },
      },
      {
        $unwind: "$ownerInfo",
      },
      {
        $project: {
          ownerInfo: {
            avatar: 1,
            username: 1,
            fullName: 1,
            createdAt: 1,
          },
          content: 1,
          tweetCreatedAt: "$createdAt",
        },
      },
      {
        $sort: { tweetCreatedAt: sort, "ownerInfo.createdAt": sortOwner },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    if (allTweets.length <= 0) {
      throw res.status(404).json(new ApiResponse(404, "No tweets found"));
    }

    const totalCount = await tweets.countDocuments(searchQuery);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Tweets fetched successfully",
          allTweets,
          totalCount
        )
      );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const updateTweet = asynHandler(async (req, res) => {
  try {
    const { content } = req?.body;

    const tweet = await tweets.findOneAndUpdate({
      _id: req?.params?.id,
      content: content,
    });
    if (!tweet) {
      throw res.status(404).json(new ApiResponse(404, "Tweet not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet updated successfully", tweet));
  } catch (error) {
    console.log(error);
  }
});

const deleteTweet = asynHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const tweet = await tweets.findByIdAndDelete(id);
    if (!tweet) {
      throw res.status(404).json(new ApiResponse(404, "Tweet not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet deleted successfully"));
  } catch (error) {
    console.error(error);
  }
});

const linkPreview = async (req, res) => {
  const { url } = req.query;

  try {
    const response = await fetch(url);
    const html = await response.text();
    // console.log(response, html);

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const title = doc.querySelector("title")?.textContent || "";
    const description =
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "";
    const logo =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      "";

    let favicon =
      doc.querySelector('link[rel="icon"]')?.getAttribute("href") || "";

    if (favicon && !favicon.startsWith("http")) {
      const baseUrl = new URL(url);
      favicon = new URL(favicon, baseUrl).toString();
    }

    console.log(logo);
    const domain = new URL(url).hostname;

    let youtubeData = {};
    if (isYouTubeURL(url)) {
      youtubeData = await extractYouTubeData(url);
    }

    const previewData = {
      title,
      logo,
      favicon,
      description,
      domain,
      url,
      ...youtubeData,
    };

    res
      .status(200)
      .json(new ApiResponse(200, "Preview fetched successfully", previewData));
  } catch (error) {
    console.error(error);
    res.status(404).json(new ApiResponse(404, "Preview failed to fetch"));
  }
};

const isYouTubeURL = (url) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const extractYouTubeData = async (youtubeUrl) => {
  try {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    const videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      youtubeVideoId: videoId,
      youtubeVideoThumbnail: videoThumbnail,
    };
  } catch (error) {
    console.error("Error extracting YouTube data:", error);
  }
};

const extractYouTubeVideoId = (url) => {
  const videoIdRegex =
    /(?:\/embed\/|\/watch\?v=|\/(?:embed\/|v\/|watch\?.*v=|youtu\.be\/|embed\/|v=))([^&?#]+)/;
  const match = url.match(videoIdRegex);
  return match ? match[1] : "";
};

export {
  createTweet,
  getUserTweets,
  getAllTweets,
  updateTweet,
  deleteTweet,
  linkPreview,
};
