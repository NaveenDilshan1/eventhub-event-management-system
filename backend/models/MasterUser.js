import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const masterUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "user", "staff"],
      default: "user",
    },

    organization: {
      type: String,
      required: true,
    },

    tenantDb: {
      type: String,
      required: true,
    },

    phone: String,
    address: String,
    avatarUrl: String,

    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true, collection: "masterusers" }
);

/* ======================
   HASH PASSWORD
====================== */
masterUserSchema.pre("save", async function () {
  // Only hash if password is new or modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ======================
   COMPARE PASSWORD
====================== */
masterUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("MasterUser", masterUserSchema);
