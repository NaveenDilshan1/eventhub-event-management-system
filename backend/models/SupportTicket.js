import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
    {
        attendee: { type: String, required: true },
        issue: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ["open", "in-progress", "resolved"],
            default: "open",
        },
        time: { type: Date, default: Date.now },
        ticketId: { type: String },
        eventName: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
