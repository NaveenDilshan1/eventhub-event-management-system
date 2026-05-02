// src/models/Report.ts
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "monthly" or "event"
  month: String,        // for monthly
  year: Number,         // for monthly
  totalEvents: Number,  // for monthly
  totalRevenue: Number, // for monthly
  totalTicketsSold: Number, // for monthly
  eventTitle: String,   // for event
  revenue: Number,      // for event
  ticketsSold: Number,  // for event
  generatedAt: Date,
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
