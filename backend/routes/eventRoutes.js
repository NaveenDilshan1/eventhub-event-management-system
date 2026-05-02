import express from "express";
import {
  createEvent,
  getPublicEvents,
  getPublicEventById,
  getAllEvents,
  getManagerEvents,
  getEventById,
  deleteEvent,
  updateEvent
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadEventImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * ================= PUBLIC ROUTES =================
 */
router.get("/public", getPublicEvents);
router.get("/public/:id", getPublicEventById);

/**
 * ================= PROTECTED ROUTES =================
 */
router.post("/", protect, uploadEventImage.single("image"), createEvent);          // Create new event with image
router.get("/", protect, getAllEvents);           // Admin
router.get("/manager", protect, getManagerEvents); // Manager
router.get("/:id", protect, getEventById);       // Admin / Manager
router.delete("/:id", protect, deleteEvent);
router.put("/:id", protect, uploadEventImage.single("image"), updateEvent);  // Update event with optional image

export default router;
