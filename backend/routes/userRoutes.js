// backend/routes/userRoutes.js
import express from "express";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users
router.get("/", getAllUsers);

export default router;
