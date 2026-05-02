import express from "express";
import { getManagerStats, getManagerEvents } from "../controllers/managerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stats & events for manager
router.get("/stats/manager", protect, getManagerStats);
router.get("/events/manager", protect, getManagerEvents);

export default router;
