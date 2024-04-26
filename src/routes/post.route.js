import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/auth.js";
import {
  createPost,
  deletePost,
  getPostDetails,
  updateCaption,
} from "../controllers/post.controller.js";

const postRouter = Router();

postRouter
  .route("/create-post")
  .post(verifyJwt, upload.single("mediaFile"), createPost);

postRouter.route("/delete/:postId").post(verifyJwt, deletePost);

postRouter.route("/update/:postId").patch(verifyJwt, updateCaption);

postRouter.route("/post-details/:postId").get(verifyJwt, getPostDetails);

export default postRouter;
