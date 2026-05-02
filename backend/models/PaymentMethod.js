import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterUser",
      required: true,
    },

    brand: {
      type: String,
      enum: ["Visa", "Mastercard", "Amex"],
      required: true,
    },

    last4: {
      type: String,
      required: true,
      length: 4,
    },

    expMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    expYear: {
      type: Number,
      required: true,
    },

    cardHolderName: {
      type: String,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", paymentMethodSchema);
