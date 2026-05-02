import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },  // ticket name/type
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    description: { type: String },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
