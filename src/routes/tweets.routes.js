import { Router } from "express";
import {
  createTweet,
  getAllTweets,
  getUserTweets,
  linkPreview,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

tweetRouter.post("/create-tweet", verifyJWT, createTweet);
tweetRouter.get("/get-tweet/:userId", verifyJWT, getUserTweets);
tweetRouter.get("/get-all-tweets", verifyJWT, getAllTweets);
tweetRouter.patch("/update-tweets/:id", verifyJWT, getAllTweets);
tweetRouter.delete("/delete-tweets/:id", verifyJWT, getAllTweets);
tweetRouter.post("/link-preview", linkPreview);

export default tweetRouter;
