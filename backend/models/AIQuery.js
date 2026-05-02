// models/AIQuery.js
import mongoose from "mongoose";

const AIQuerySchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AIQuery", AIQuerySchema);
