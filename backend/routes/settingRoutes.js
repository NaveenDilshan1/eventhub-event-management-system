import express from "express";
import { getSettings, updateSettings, uploadLogo } from "../controllers/settingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadBrandingImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/upload-logo", protect, uploadBrandingImage.single("logo"), uploadLogo);

export default router;
