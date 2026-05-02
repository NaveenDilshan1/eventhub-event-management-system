import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  sold: { type: Number, required: true },
});

const analyticsSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  eventName: { type: String, required: true },
  totalRevenue: { type: Number, required: true },
  ticketsSold: { type: Number, required: true },
  attendees: { type: Number, required: true },
  ticketTypes: [ticketTypeSchema],
  month: { type: String },
  year: { type: Number },
}, { timestamps: true });

export default mongoose.model("Analytics", analyticsSchema);
