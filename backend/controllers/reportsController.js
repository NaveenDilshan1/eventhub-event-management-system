// backend/controllers/reportsController.js
import Report from "../models/Report.js";  // Your reports collection model
import Event from "../models/Event.js";    // Your events collection model

// 1️⃣ Monthly Revenue (Calculated dynamically from Events)
export const getMonthlyRevenue = async (req, res) => {
  try {
    const events = await Event.find().select("price soldTickets date createdAt");

    const revenueMap = {};

    events.forEach((e) => {
      const date = new Date(e.date || e.createdAt);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const label = `${month} ${year}`;

      const revenue = (e.price || 0) * (e.soldTickets || 0);
      const tickets = e.soldTickets || 0;

      if (!revenueMap[label]) {
        revenueMap[label] = {
          month: label,
          revenue: 0,
          tickets: 0,
          events: 0,
          sortKey: date.getTime()
        };
      }

      revenueMap[label].revenue += revenue;
      revenueMap[label].tickets += tickets;
      revenueMap[label].events += 1;
    });

    // Sort chronologically and take last 12 months
    const data = Object.values(revenueMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, revenue, tickets, events }) => ({
        month,
        revenue,
        tickets,
        events
      }))
      .slice(-12);

    res.json(data);
  } catch (err) {
    console.error("Error in getMonthlyRevenue:", err);
    res.status(500).json({ error: "Failed to fetch monthly revenue" });
  }
};

// 2️⃣ Event Categories
export const getEventCategories = async (req, res) => {
  try {
    // Aggregate events by type/category
    const categories = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$_id", "Uncategorized"] },
          value: 1,
        },
      },
    ]);

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event categories" });
  }
};
