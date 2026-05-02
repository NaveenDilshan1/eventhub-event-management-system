import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  ticketType: String,
  status: String,
  registeredAt: Date,
  eventId: { type: String, ref: "Event" },
  checkedIn: { type: Boolean, default: false },
  checkInTime: Date,
});

export default mongoose.model("Attendee", attendeeSchema);
