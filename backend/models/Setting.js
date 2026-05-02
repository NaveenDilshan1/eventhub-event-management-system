// backend/models/Setting.js
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  timezone: { type: String, default: "Asia/Kolkata" },
  language: { type: String, default: "en" },
  notifications: { type: Boolean, default: true },
  theme: { type: String, default: "light" },
}, { timestamps: true });

export default mongoose.model("Setting", settingSchema);
