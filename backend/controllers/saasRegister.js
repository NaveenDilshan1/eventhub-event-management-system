import Tenant from "../models/Tenant.js";
import { getTenantDB } from "../config/tenantDB.js";
import userSchema from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerOrganization = async (req, res) => {
  try {
    const { companyName, email, password, logo, themeColor, eventTypes } = req.body;

    const dbName = companyName.toLowerCase().replace(/\s/g, "_");

    const tenant = await Tenant.create({ companyName, dbName, ownerEmail: email, logo, themeColor, eventTypes });

    const tenantDB = await getTenantDB(dbName);

    const User = tenantDB.model("User", userSchema);

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name: companyName + " Admin",
      email,
      password: hashedPassword,
      role: "admin"
    });

    const token = jwt.sign({ id: adminUser._id, role: adminUser.role, tenantDb: dbName }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Organization registered successfully",
      user: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      token
    });
  } catch (err) {
    console.error("REGISTER ORG ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};
