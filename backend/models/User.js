import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ["admin", "manager", "staff", "user"], default: "user" },
    status: { type: String, enum: ["active", "suspended", "pending"], default: "active" },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: "users" }
);

export default mongoose.model("User", userSchema);
