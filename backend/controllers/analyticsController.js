import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

// GET analytics
export const getAnalytics = async (req, res) => {
  try {
    const managerId = req.user.id;
    const role = req.user.role;

    // Filter by manager if not admin/staff/manager
    const query = (role === "admin" || role === "staff" || role === "manager") ? {} : { createdBy: managerId };
    const events = await Event.find(query);

    // 1️⃣ Total Revenue
    const totalRevenue = events.reduce((acc, e) => acc + (e.price || 0) * (e.soldTickets || 0), 0);

    // 2️⃣ Total Tickets Sold
    const totalTicketsSold = events.reduce((acc, e) => acc + (e.soldTickets || 0), 0);

    // 3️⃣ Total Attendees (Based on check-ins or sales)
    const totalAttendees = totalTicketsSold;

    // 4️⃣ Conversion Rate (Sold / Capacity)
    const totalCapacity = events.reduce((acc, e) => acc + (e.totalTickets || 0), 0);
    const conversionRate = totalCapacity
      ? Math.round((totalTicketsSold / totalCapacity) * 100)
      : 0;

    // 5️⃣ Revenue Trend (Group events by month)
    const revenueMap = {};
    events.forEach((e) => {
      const date = new Date(e.date || e.createdAt);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const label = `${month} ${year}`;

      if (!revenueMap[label]) revenueMap[label] = { month: label, revenue: 0, tickets: 0, sortKey: date.getTime() };
      revenueMap[label].revenue += (e.price || 0) * (e.soldTickets || 0);
      revenueMap[label].tickets += (e.soldTickets || 0);
    });

    // Sort by date and take last 6-12 months
    const revenueData = Object.values(revenueMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, revenue, tickets }) => ({ month, revenue, tickets }));

    // 6️⃣ Event Performance Comparison
    const eventPerformance = events.map((e) => ({
      name: e.title,
      revenue: (e.price || 0) * (e.soldTickets || 0),
      attendees: e.soldTickets || 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5); // Top 5

    res.json({
      totalRevenue,
      totalTicketsSold,
      totalAttendees,
      conversionRate,
      revenueData,
      ticketTypeData: [], // Default empty as we use event-level tickets mostly
      eventPerformance,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
};
