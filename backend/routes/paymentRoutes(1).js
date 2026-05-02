import express from "express";
import {
  getUserPayments,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getUserPayments);
router.get("/methods/my", protect, getPaymentMethods);
router.post("/methods/my", protect, addPaymentMethod);
router.delete("/methods/:id", protect, deletePaymentMethod);

export default router;
