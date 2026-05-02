import MasterUser from "../models/MasterUser.js";
import bcrypt from "bcrypt";

/* ===============================
   GET ALL USERS
=============================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await MasterUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ===============================
   GET SINGLE USER (profile)
=============================== */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await MasterUser.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* ===============================
   CREATE NEW USER
=============================== */
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, organization, tenantDb } = req.body;

    if (!firstName || !email || !password || !organization) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existing = await MasterUser.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Generate tenantDb if not provided
    const dbName = tenantDb || `${organization.toLowerCase().replace(/\s+/g, "_")}_db`;

    const user = await MasterUser.create({
      firstName,
      lastName: lastName || "",
      email,
      password,
      role: role || "user",
      organization,
      tenantDb: dbName,
      status: "active"
    });
    res.status(201).json(user);
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* ===============================
   UPDATE USER ROLE
=============================== */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "Role is required" });

    const user = await MasterUser.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

/* ===============================
   UPDATE USER STATUS
=============================== */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const user = await MasterUser.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ===============================
   DELETE USER
=============================== */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await MasterUser.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/* ===============================
   UPDATE USER PROFILE
=============================== */
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("UPDATING PROFILE FOR ID:", id);
    console.log("REQ BODY:", req.body);

    const { firstName, lastName, email, phone, address, notifications } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (notifications) {
      try {
        updateData.notifications = typeof notifications === "string"
          ? JSON.parse(notifications)
          : notifications;
      } catch (e) {
        console.error("Notify parse err", e);
      }
    }

    if (req.file) {
      updateData.avatarUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await MasterUser.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ===============================
   UPDATE PASSWORD
=============================== */
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" });
    }

    const user = await MasterUser.findById(id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
};
