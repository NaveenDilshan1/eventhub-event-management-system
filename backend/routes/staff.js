import express from "express";
import {
    scanTicket,
    getEventAttendees,
    getRecentScans,
    deleteScanLog,
    getStaffEvents,
    getSupportTickets,
    createSupportTicket,
    searchAttendee,
    getLiveStats,
    deleteSupportTicket
} from "../controllers/staffController.js";
import { uploadScanImage } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Camera or QR string scan
router.post("/scan", protect, uploadScanImage.single("scanImage"), scanTicket);

// List of recent scans for the dashboard
router.get("/recent-scans", protect, getRecentScans);

// Delete an individual scan record
router.delete("/recent-scans/:id", protect, deleteScanLog);

// List events assigned to staff
router.get("/events", protect, getStaffEvents);

// List attendees for event
router.get("/events/:eventId/attendees", protect, getEventAttendees);

// Support tickets
router.get("/support-tickets", protect, getSupportTickets);
router.post("/support-tickets", protect, createSupportTicket);
router.delete("/support-tickets/:id", protect, deleteSupportTicket);

// Search attendee
router.get("/search-attendee", protect, searchAttendee);

// Live stats
router.get("/live-stats", protect, getLiveStats);

export default router;
