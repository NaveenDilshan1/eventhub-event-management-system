// backend/controllers/statsController.js
import Event from "../models/Event.js";
import MasterUser from "../models/MasterUser.js";

// ==================== MANAGER STATS ====================
export const getManagerStats = async (req, res) => {
  try {
    const role = req.user.role;

    const query = (role === "admin" || role === "staff" || role === "manager") ? {} : { createdBy: managerId };
    const events = await Event.find(query).lean();
    const totalEvents = events.length;
    const ticketsSold = events.reduce((acc, e) => acc + (e.soldTickets || 0), 0);
    const totalRevenue = events.reduce((acc, e) => acc + ((e.soldTickets || 0) * (e.price || 0)), 0);

    const activeUsers = await MasterUser.countDocuments({ role: "user" }); // Count only end users

    res.status(200).json({ totalEvents, ticketsSold, totalRevenue, activeUsers });
  } catch (err) {
    console.error("GET MANAGER STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch manager stats" });
  }
};

// ==================== ADMIN STATS ====================
export const getAdminStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();

    const events = await Event.find({});
    let ticketsSold = 0;
    let totalRevenue = 0;

    events.forEach((e) => {
      ticketsSold += e.soldTickets || 0;
      totalRevenue += (e.soldTickets || 0) * (e.price || 0);
    });

    const totalUsers = await MasterUser.countDocuments({ role: { $in: ["user", "staff", "manager"] } });

    res.status(200).json({ totalEvents, ticketsSold, totalRevenue, totalUsers });
  } catch (err) {
    console.error("GET ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};
