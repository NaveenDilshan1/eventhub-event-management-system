import express from "express";
import {
  getAllAttendees,
  getAttendeesByEvent,
  sendEmailsToAttendees,
  updateAttendee,
  checkInAttendee,
  getManagerAttendees,
  deleteAttendee,
} from "../controllers/attendeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get attendees for logged-in manager
router.get("/manager", protect, getManagerAttendees);

// Get all attendees
router.get("/", getAllAttendees);

// Get attendees by eventId (updated route)
router.get("/events/:eventId/attendees", getAttendeesByEvent);

// Check-in attendee
router.post("/attendees/:id/checkin", checkInAttendee);

// Send emails (mock)
router.post("/send-email", sendEmailsToAttendees);

// Update attendee info
router.put("/:id", updateAttendee);

// Delete attendee
router.delete("/:id", deleteAttendee);

export default router;
