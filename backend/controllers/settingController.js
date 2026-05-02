// backend/controllers/settingsController.js
import fs from "fs";
import path from "path";

// Optional: simple JSON file storage (for demo purposes)
const settingsFile = path.join(process.cwd(), "settings.json");

// Default settings
const defaultSettings = {
  timezone: "Asia/Colombo",
  language: "en",
  currency: "LKR",
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  maintenanceMode: false,
  twoFactorAuth: false,
  sessionTimeout: "30",
  passwordExpiry: "90",
  ipWhitelist: "",
  apiKey: "sk_live_xxxxx",
  webhookUrl: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPassword: "",
  senderName: "Event Hub",
  senderEmail: "",
  websiteName: "Event Hub Pro",
  websiteLogo: "/logo.png",
};

// GET /api/settings
export const getSettings = (req, res) => {
  try {
    if (!fs.existsSync(settingsFile)) {
      fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
    }
    const data = fs.readFileSync(settingsFile, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get settings" });
  }
};

// PUT /api/settings
export const updateSettings = (req, res) => {
  try {
    const newSettings = { ...defaultSettings, ...req.body };
    fs.writeFileSync(settingsFile, JSON.stringify(newSettings, null, 2));
    res.json(newSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save settings" });
  }
};

// POST /api/settings/upload-logo
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }

    const logoUrl = `/uploads/branding/${req.file.filename}`;
    res.status(200).json({
      message: "Logo uploaded successfully",
      url: logoUrl
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    res.status(500).json({ message: "Failed to upload logo" });
  }
};
