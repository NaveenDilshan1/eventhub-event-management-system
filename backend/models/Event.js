import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  category: String,
  status: String,
  totalTickets: Number,
  soldTickets: Number,
  price: Number,
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "MasterUser" }, // ✅ important
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", eventSchema);
