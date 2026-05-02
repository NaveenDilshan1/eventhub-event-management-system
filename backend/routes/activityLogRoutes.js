import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import ScanLog from "../models/ScanLog.js";

const router = express.Router();

// GET /api/activity-log
router.get("/", protect, async (req, res) => {
    try {
        const logs = await ScanLog.find().sort({ time: -1 }).limit(10);

        const mapped = logs.map(log => ({
            _id: log._id,
            type: log.type === "success" ? "Check-in" : "System",
            description: `${log.name} - ${log.status === "success" ? "Successful check-in" : "Failed check-in"}`,
            generatedAt: log.time
        }));

        res.json(mapped);
    } catch (err) {
        console.error("ACTIVITY LOG ERROR:", err);
        res.status(500).json({ message: "Failed to fetch activity logs" });
    }
});

export default router;
