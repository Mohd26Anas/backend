import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN,
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import fileUploaderRoute from "./routes/fileUpload.routes.js";
import subscribedRouter from "./routes/subscribes.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweets.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/likes.routes.js";

app.use(express.json());
app.get("/", function (req, res) {
  res.json({ message: "Hello World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/file-upload", fileUploaderRoute);
app.use("/subscribe", subscribedRouter);
app.use("/video", videoRouter);
app.use("/tweets", tweetRouter);
app.use("/playlist", playlistRouter);
app.use("/comment", commentRouter);
app.use("/like", likeRouter);
export { app };
