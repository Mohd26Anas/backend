import { ApiResponse } from "../utils/apiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadFile } from "../utils/fileUpload.js";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

const uploadFileApi = asynHandler(async (req, res) => {
  const image = await uploadFile(req.files?.file[0]?.path);

  if (!image?.url) {
    throw new ApiError(400, "File not uploaded");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, image, "File uploaded successfully"));
});

const uploadVideo = asynHandler(async (req, res) => {
  const file = req.files?.file?.[0];
  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }
  const videoId = uuidv4();
  const videoPath = req.files?.file[0]?.path;
  const outputPath = path.resolve(`./uploads/${videoId}`);
  const hlsPath = path.join(outputPath, "index.m3u8");
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Create thumbnails directory
  const thumbnailsPath = path.join(outputPath, "thumbnails");
  if (!fs.existsSync(thumbnailsPath)) {
    fs.mkdirSync(thumbnailsPath, { recursive: true });
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  ffmpeg(videoPath)
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputOptions([
      "-hls_time 5",
      "-hls_playlist_type vod",
      `-hls_segment_filename ${outputPath}/segment%03d.ts`,
      "-start_number 0",
    ])
    .output(hlsPath)
    .on("progress", (progress) => {
      if (progress.percent) {
        const chunk =
          JSON.stringify({
            progress: Math.floor(progress.percent),
          }) + "\n";
        res.write(chunk);
      }
    })
    .on("end", async () => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error(`FFprobe error: ${err}`);
          res.status(500).json({ error: "Failed to retrieve video metadata" });
          return;
        }

        const duration = metadata.format.duration;
        const thumbnailInterval = 10; // Generate a thumbnail every 10 seconds
        const thumbnailCount = Math.floor(duration / thumbnailInterval);

        ffmpeg(videoPath)
          .on("end", async () => {
            console.log("Thumbnails generated successfully");

            const videoUrl = `http://localhost:8080/uploads/${videoId}/index.m3u8`;

            res
              .status(200)
              .json(
                new ApiResponse(200, videoUrl, "Video uploaded successfully")
              );
            res.end();

            try {
              await unlinkAsync(videoPath);
            } catch (unlinkError) {
              console.error(
                `Failed to delete original video file: ${unlinkError}`
              );
            }
          })
          .on("error", (thumbError) => {
            console.error(`Thumbnail generation error: ${thumbError}`);
            res.status(500).json({ error: "Failed to generate thumbnails" });
          })
          .screenshots({
            count: thumbnailCount,
            filename: "thumb%04d.jpg",
            folder: thumbnailsPath,
            size: "420x240",
            timemarks: Array.from(
              { length: thumbnailCount },
              (_, i) => i * thumbnailInterval
            ),
          });
      });
    })
    .on("error", (error) => {
      console.error(error);
      const chunk =
        JSON.stringify(new ApiResponse(500, "Internal Server Error")) + "\n";
      res.write(chunk);
      res.end();
    })
    .run();
});

export { uploadFileApi, uploadVideo };
