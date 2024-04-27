import verifyJwt from "../middlewares/auth.js";
import {
  updateComment,
  createComment,
  deleteComment,
  getComment,
} from "../controllers/comment.controller.js";
import { Router } from "express";

const commentRouter = Router();

commentRouter.use(verifyJwt);

commentRouter.route("/create").post(createComment);

commentRouter.route("/delete/:commentId").post(deleteComment);

commentRouter.route("/update/:commentId").patch(updateComment);

commentRouter.route("/:commentId").get(getComment);

export default commentRouter;
