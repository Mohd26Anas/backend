import { Router } from "express";
import {
  changepassword,
  currentUser,
  logOut,
  login,
  refreshToken,
  registerUser,
  updateDetails,
  usersData,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
userRouter.route("/login").post(login);

userRouter.route("/logout").post(verifyJWT, logOut);
userRouter.route("/refreshToken").post(refreshToken);
userRouter.route("/change-password").post(verifyJWT, changepassword);
userRouter.route("/get-user").get(verifyJWT, currentUser);
userRouter.route("/get-data/:id").get(usersData);
userRouter.route("/update-user").patch(verifyJWT, updateDetails);

export default userRouter;
