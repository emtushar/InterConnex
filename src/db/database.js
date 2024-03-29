import mongoose from "mongoose";
import { dbName } from "../constants.js";

export const connectDB = async () => {
  try {
    const mongodbInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${dbName}`
    );
    console.log(`Mongodb connected at :${mongodbInstance.connection.host}`);
  } catch (error) {
    console.error(`Error occured in db ${error}`);
    process.exit(1);
  }
};
