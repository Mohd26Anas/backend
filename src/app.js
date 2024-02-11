import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import fileUploaderRoute from "./routes/fileUpload.routes.js";
import entityRouter from "./routes/createEntity.routes.js";
import subscribedRouter from "./routes/subscribes.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/file-upload", fileUploaderRoute);
app.use("/entity", entityRouter);
app.use("/subscribe", subscribedRouter);
app.use("/video", videoRouter);

export { app };
