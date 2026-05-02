import express from "express";
import { bookTicket, getManagerBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/book", protect, bookTicket);
router.get("/manager", protect, getManagerBookings);

export default router;
