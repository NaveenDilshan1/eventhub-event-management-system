import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllTenants } from "../controllers/tenantController.js";

const router = express.Router();

router.get("/", protect, getAllTenants);

export default router;
