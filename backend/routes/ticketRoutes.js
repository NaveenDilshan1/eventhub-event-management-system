import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  getTicketsByEvent,
  getManagerTickets
} from "../controllers/ticketController.js";

const router = express.Router();

// GET all tickets
router.get("/", getTickets);

// GET logged-in user's tickets (for attendees)
router.get("/my", protect, getMyTickets);

// GET manager's tickets (for ticketing dashboard)
router.get("/manager", protect, getManagerTickets);

// GET ticket by ID
router.get("/:id", getTicketById);

// UPDATE ticket by ID
router.put("/:id", updateTicket);

// ✅ GET tickets for a specific event
router.get("/event/:eventId", getTicketsByEvent);

export default router;
