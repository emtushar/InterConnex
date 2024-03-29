import dotenv from "dotenv";
import { connectDB } from "./db/database.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Server Failed ${error}`);
    });
    app.listen(process.env.PORT, () => {
      console.log(
        `Server started successfully at http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log("Mongodb Database Failed :", error);
  });
