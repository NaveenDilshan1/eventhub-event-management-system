import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MasterUser from "../models/MasterUser.js";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role = "admin", organization } = req.body;
    console.log("REGISTRATION ATTEMPT:", { fullName, email, role, organization });

    if (!fullName || !email || !password || !organization) {
      console.warn("Registration missing fields:", { fullName: !!fullName, email: !!email, password: !!password, organization: !!organization });
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    let lastName = nameParts.slice(1).join(" ") || " ";

    console.log("PROCESSED NAME:", { firstName, lastName });

    const exists = await MasterUser.findOne({ email });
    if (exists) {
      console.warn("User already exists:", email);
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const tenantDb = `tenant_${email.split("@")[0]}_${Date.now()}`;


    const user = await MasterUser.create({
      firstName,
      lastName,
      email,
      password,
      role,
      organization,
      tenantDb,
    });



    const token = jwt.sign(
      { id: user._id, role: user.role, tenantDb: user.tenantDb },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        tenantDb: user.tenantDb,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

/* =========================
   LOGIN USER
 ========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await MasterUser.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, tenantDb: user.tenantDb },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        tenantDb: user.tenantDb,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};

/* =========================
   GET PROFILE
 ========================= */
export const getProfile = async (req, res) => {
  try {
    const user = await MasterUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};
