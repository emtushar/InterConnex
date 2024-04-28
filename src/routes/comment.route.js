import verifyJwt from "../middlewares/auth.js";
import {
  updateComment,
  createComment,
  deleteComment,
  getComment,
  toggleCommmentLike,
} from "../controllers/comment.controller.js";
import { Router } from "express";

const commentRouter = Router();

commentRouter.use(verifyJwt);

commentRouter.route("/create").post(createComment);

commentRouter.route("/delete/:commentId").post(deleteComment);

commentRouter.route("/update/:commentId").patch(updateComment);

commentRouter.route("/:commentId").get(getComment);

commentRouter.route("/toggle-like/:commentId").patch(toggleCommmentLike);

export default commentRouter;
