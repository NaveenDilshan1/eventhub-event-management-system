import mongoose from "mongoose";

const scanLogSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  time: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], default: "failed" },
  message: { type: String }, // Optional: "Already scanned", "Invalid ticket", etc.
});

export default mongoose.model("ScanLog", scanLogSchema);
