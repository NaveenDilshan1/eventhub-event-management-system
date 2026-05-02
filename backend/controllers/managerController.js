import Event from "../models/Event.js";
import MasterUser from "../models/MasterUser.js";

// Get stats for manager
export const getManagerStats = async (req, res) => {
  try {
    const managerId = req.user.id; // from auth middleware

    // Total events created by this manager
    const totalEvents = await Event.countDocuments({ createdBy: managerId });

    // Tickets sold for this manager's events
    const events = await Event.find({ createdBy: managerId });
    const ticketsSold = events.reduce((acc, e) => acc + (e.soldTickets || 0), 0);
    const totalRevenue = events.reduce((acc, e) => acc + ((e.soldTickets || 0) * (e.price || 0)), 0);

    // Active users (unique users who bought tickets)
    const activeUsers = await MasterUser.countDocuments({ role: "user" }); // adjust if needed

    res.json({ totalEvents, ticketsSold, totalRevenue, activeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch manager stats" });
  }
};

// Get manager's latest events
export const getManagerEvents = async (req, res) => {
  try {
    const managerId = req.user.id;

    const events = await Event.find({ createdBy: managerId })
      .sort({ createdAt: -1 })
      .limit(10); // latest 10 events

    const eventsData = events.map((e) => ({
      _id: e._id,
      name: e.title,
      date: e.date,
      totalTickets: e.totalTickets,
      ticketsSold: e.soldTickets,
      price: e.price,
      status: e.status || "upcoming",
    }));

    res.json(eventsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch manager events" });
  }
};
