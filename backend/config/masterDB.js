import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // MUST be first

const connectMasterDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "event_management"
    }); // Connect to the specific database requested by the user
    console.log("Master DB connected");
  } catch (err) {
    console.error("Master DB connection failed:", err.message);
    process.exit(1);
  }
};

connectMasterDB();
