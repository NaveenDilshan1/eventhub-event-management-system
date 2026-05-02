import mongoose from "mongoose";
import Tenant from "./models/Tenant.js";

export async function getTenantConnection(userEmail) {
  const tenant = await Tenant.findOne({ adminEmail: userEmail });
  if (!tenant) throw new Error("Tenant not found");

  // Reuse connection if exists
  const existingConn = mongoose.connections.find(c => c.name === tenant.dbName);
  if (existingConn) return existingConn;

  // Create new connection
  const conn = await mongoose.createConnection(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0/${tenant.dbName}?retryWrites=true&w=majority`
  );

  return conn;
}
