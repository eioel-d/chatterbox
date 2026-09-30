import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import { Room } from "../models/Room.js";

// dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  await mongoose.connect(env.mongoUri);
  if (!(await Room.countDocuments())) {
    await Room.insertMany(
      ["general", "study", "gaming"].map((name) => ({
        name,
        createdBy: "system",
      })),
    );
  }
}
