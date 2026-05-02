import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    billingCycle: { type: String, required: true },
    status: { type: String },
    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date }
  },
  {
    collection: "billing"   // 🔴 MUST BE EXACT
  }
);

export default mongoose.model("Billing", billingSchema);
