import express from "express";
import { getAdminStats, getManagerStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/stats/admin
router.get("/admin", protect, getAdminStats);

// GET /api/stats/manager
router.get("/manager", protect, getManagerStats);

export default router;
