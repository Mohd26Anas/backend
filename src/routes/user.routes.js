import { Router } from "express";
import { logOut, login, refreshToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 }
]),
  registerUser
);
userRouter.route("/login").post(

  login
);

userRouter.route("/logout").post(
  verifyJWT,
  logOut
)
userRouter.route('/refreshToken').post(refreshToken)


export default userRouter;
