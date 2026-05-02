import Organization from "../models/Organization.js";
import User from "../models/User.js";

export const registerOrganization = async (req, res) => {
  try {
    const { userId, name, industry, website, address, city, country } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ message: "Organization name and industry are required" });
    }

    const organization = await Organization.create({ name, industry, website, address, city, country });

    // Link user to organization
    if (userId) {
      await User.findByIdAndUpdate(userId, { organization: organization._id });
    }

    res.status(201).json({ message: "Organization registered", organization });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Organization registration failed", error: err.message });
  }
};
