import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateProfile,
  updatePassword,
} from "../controllers/masterUserController.js";
import { uploadProfileImage } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD routes
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById); // fetch single user (profile)
router.post("/", protect, createUser);

// Profile Update (with optional avatar)
router.put("/:id", protect, uploadProfileImage.single("avatar"), updateProfile);
router.put("/:id/password", protect, updatePassword);

// Update routes
router.patch("/:id/role", protect, updateUserRole);
router.patch("/:id/status", protect, updateUserStatus);

// Delete user
router.delete("/:id", protect, deleteUser);

export default router;
