import { Router } from "express";
import {
  changeUserAvatar,
  changeUserDetails,
  changeUserPassword,
  getCurrentUser,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  toggleFollowUser,
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

userRouter.route("/refresh-token").post(verifyJwt, refreshAccessToken);

userRouter.route("/current-user").get(verifyJwt, getCurrentUser);

userRouter.route("/profile/:username").get(verifyJwt, getUserProfile);

userRouter.route("/follow-unfollow/:id").patch(verifyJwt, toggleFollowUser);

export { userRouter };
