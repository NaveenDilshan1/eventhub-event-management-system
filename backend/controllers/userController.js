// backend/controllers/userController.js
import MasterUser from "../models/MasterUser.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await MasterUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
