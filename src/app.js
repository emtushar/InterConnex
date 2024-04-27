import express from "express";
import { userRouter } from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.static("public/temp"));

app.use("/api/v1/user", userRouter);

app.use("/api/v1/post", postRouter);

app.use("/api/v1/comment", commentRouter);

app.get("/", (req, res) => {
  res.send("<h2>Hello</h2>");
});
export default app;
