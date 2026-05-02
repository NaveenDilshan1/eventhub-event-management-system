// server.js
import dotenv from "dotenv";
dotenv.config(); // MUST be first
import path from "path";
import express from "express";
import cors from "cors";
import "./config/masterDB.js"; // Master DB connection

// Routes
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import attendeeRoutes from "./routes/attendeeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiRoutes from "./routes/ai.js";
import settingRoutes from "./routes/settingRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import invoices from "./routes/invoices.js";
import masterUserRoutes from "./routes/masterUserRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import staffRoutes from "./routes/staff.js"; // Existing staff routes
import paymentRoutes from "./routes/paymentRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import activityRoutes from "./routes/activityLogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// ✅ ScanLog is now defined in backend/models/ScanLog.js
// It will be initialized through the controllers/routes that import it.

import Ticket from "./models/Ticket.js"; // Your existing Ticket schema

// Express setup
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// API Routes
app.get("/api/test", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/invoices", invoices);
app.use("/api/masterusers", masterUserRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/activity-log", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Static files
app.use("/uploads/scans", express.static(path.join(process.cwd(), "uploads/scans")));
app.use("/uploads/events", express.static(path.join(process.cwd(), "uploads/events")));
app.use("/uploads/profiles", express.static(path.join(process.cwd(), "uploads/profiles")));
app.use("/uploads/branding", express.static(path.join(process.cwd(), "uploads/branding")));

// ✅ Categories endpoint
app.get("/api/categories", (req, res) => {
  const categories = [
    "Conference",
    "Concert",
    "Workshop",
    "Seminar",
    "Festival",
    "Sports",
    "Exhibition",
    "Networking",
    "Training",
    "Meetup",
  ];
  res.json(categories);
});

// ✅ Staff QR Scan API endpoint
// Staff endpoints are handled via staffRoutes in routes/staff.js

// Test route
app.get("/", (req, res) => res.send("Backend is running!"));

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
