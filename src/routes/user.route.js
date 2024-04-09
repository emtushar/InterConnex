import { Router } from "express";
import {
  changeUserAvatar,
  changeUserDetails,
  changeUserPassword,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/auth.js";

const userRouter = Router();

userRouter.route("/register").post(upload.single("avatar"), registerUser);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJwt, logoutUser);

userRouter
  .route("/change-avatar")
  .patch(verifyJwt, upload.single("avatar"), changeUserAvatar);

userRouter.route("/change-password").patch(verifyJwt, changeUserPassword);

userRouter.route("/update-account").patch(verifyJwt, changeUserDetails);

export { userRouter };
