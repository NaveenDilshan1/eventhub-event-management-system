import Tenant from "../models/Tenant.js";
import Event from "../models/Event.js";
import MasterUser from "../models/MasterUser.js";

export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();

    const data = await Promise.all(
      tenants.map(async (t) => {
        const totalUsers = await MasterUser.countDocuments({ tenant: t._id });
        const totalEvents = await Event.countDocuments({ tenant: t._id });

        return {
          _id: t._id,
          organization: t.companyName,
          dbName: t.dbName,
          createdAt: t.createdAt,
          totalUsers,
          activeUsers: totalUsers,
          totalEvents,
        };
      })
    );

    res.json(data);
  } catch (err) {
    console.error("TENANT FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
};
