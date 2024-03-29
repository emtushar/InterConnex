import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("<h2>Hello</h2>");
});
export default app;
