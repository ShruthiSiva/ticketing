import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  try {
    // Always check that we have the required env variables during startup.
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_Key must be defined");
    }

    // Adding a /auth to the end tells mongoose to create that auth DB on its own if it doesn't exist.
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000...");
  });
};

start();
