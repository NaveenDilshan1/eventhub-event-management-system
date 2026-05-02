import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterUser", // use your existing masterusers collection
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      enum: ["Visa", "Mastercard", "Amex", "Paypal"],
      default: "Visa",
    },
    status: {
      type: String,
      enum: ["Completed", "Refunded", "Pending"],
      default: "Completed",
    },
    buyerName: {
      type: String,
    },
    customTicketId: {
      type: String,
    },
    ticketType: {
      type: String,
      default: "Standard",
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
