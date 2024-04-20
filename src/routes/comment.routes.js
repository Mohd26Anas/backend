import { Router } from "express";
import {
  addComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.post("/add-comment", verifyJWT, addComment);
commentRouter.patch("/update-comment/:commentId", verifyJWT, updateComment);

export default commentRouter;
