import { addLike } from "../controllers/likes.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.post("/addLike", verifyJWT, addLike);

export default likeRouter;
