import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directories exist
const uploadsDir = path.join(process.cwd(), "uploads");
const scansDir = path.join(uploadsDir, "scans");
const eventsDir = path.join(uploadsDir, "events");
const profilesDir = path.join(uploadsDir, "profiles");
const brandingDir = path.join(uploadsDir, "branding");

[uploadsDir, scansDir, eventsDir, profilesDir, brandingDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Save branding images to uploads/branding
const brandingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, brandingDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = "logo_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Save uploaded scan images to uploads/scans
const scanStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, scansDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Save event images to uploads/events
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, eventsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// Save profile images to uploads/profiles
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

export const uploadScanImage = multer({ storage: scanStorage });
export const uploadEventImage = multer({ storage: eventStorage });
export const uploadProfileImage = multer({ storage: profileStorage });
export const uploadBrandingImage = multer({ storage: brandingStorage });
