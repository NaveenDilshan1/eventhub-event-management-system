import mongoose from "mongoose";

const tenantConnections = {};

export const tenantMiddleware = async (req, res, next) => {
  try {
    const dbName = req.user.tenantDb;   // Comes from master DB

    if (!dbName) {
      return res.status(400).json({ message: "Tenant DB not assigned" });
    }

    if (!tenantConnections[dbName]) {
      tenantConnections[dbName] = mongoose.createConnection(
        process.env.MONGO_URI.replace("master_db", dbName)
      );
      console.log("Tenant connected:", dbName);
    }

    req.tenantDb = tenantConnections[dbName];
    next();
  } catch (err) {
    console.error("Tenant error:", err);
    res.status(500).json({ message: "Tenant connection failed" });
  }
};
