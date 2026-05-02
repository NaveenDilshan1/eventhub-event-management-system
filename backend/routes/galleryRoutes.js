import express from "express";
import {
  uploadGalleryImage,
  getEventGallery,
  deleteGalleryImage,
  updateGalleryCaption,
} from "../controllers/galleryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadEventImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * Gallery Routes
 */
router.get("/:eventId", getEventGallery); // Public - get gallery images
router.post("/:eventId", protect, uploadEventImage.single("image"), uploadGalleryImage); // Upload image
router.delete("/:eventId/:imageId", protect, deleteGalleryImage); // Delete image
router.put("/:imageId", protect, updateGalleryCaption); // Update caption

export default router;
