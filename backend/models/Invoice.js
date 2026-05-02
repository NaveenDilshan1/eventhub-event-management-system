// backend/models/Invoice.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  plan: String,
  amount: Number,
  currency: String,
  date: Date,
  status: String
}, { timestamps: true });

export default mongoose.model("Invoices", invoiceSchema);
