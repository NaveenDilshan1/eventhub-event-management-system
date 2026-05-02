import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  companyName: String,
  dbName: String,
  logo: String,
  themeColor: String,
  eventTypes: [String],
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
