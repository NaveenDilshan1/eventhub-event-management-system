import Ticket from "../models/Ticket.js";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

// GET all tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// GET ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
};

// GET tickets for a specific event
export const getTicketsByEvent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ eventId: req.params.eventId });
    if (!tickets.length) return res.status(404).json({ message: "No tickets found for this event" });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tickets by event" });
  }
};

// UPDATE ticket by ID
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const { title, price, quantity, sold, description } = req.body;

    ticket.title = title ?? ticket.title;
    ticket.price = price ?? ticket.price;
    ticket.quantity = quantity ?? ticket.quantity;
    ticket.sold = sold ?? ticket.sold;
    ticket.description = description ?? ticket.description;
    ticket.updatedAt = new Date();

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update ticket" });
  }
};

// GET logged-in user's booked tickets (from Booking collection)
export const getMyTickets = async (req, res) => {
  try {
    // Find all bookings by the logged-in user
    const bookings = await Booking.find({ user: req.user.id }).populate("eventId");

    // Map bookings to frontend-friendly ticket structure
    const mapped = bookings
      .filter(b => b.eventId) // Safety check: case where event might be deleted
      .map((b) => {
        const eventDate = new Date(b.eventId.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        return {
          _id: b._id,
          eventId: b.eventId._id,
          eventName: b.eventId.title,
          eventImage: b.eventId.imageUrl || "",
          date: b.eventId.date,
          time: b.eventId.time,
          location: b.eventId.location,
          type: b.ticketTitle || "Standard",
          price: `₹${b.totalAmount || 0}`,
          status: eventDate >= today ? "upcoming" : "past",
          qrImage: `/uploads/scans/${b._id}.png`,
          customTicketId: b.customTicketId || b._id,
          attendeeName: b.buyerName,
          attendeeEmail: b.buyerEmail,
          attendeePhone: b.buyerPhone,
        };
      });

    res.json(mapped);
  } catch (err) {
    console.error("Failed to fetch user tickets", err);
    res.status(500).json({ message: "Failed to fetch user tickets" });
  }
};

// GET tickets for manager's events (Derived from Event data as performance metrics)
export const getManagerTickets = async (req, res) => {
  try {
    const managerId = req.user.id;
    const role = req.user.role;

    // Find events owned by manager (or all if admin/staff/manager)
    const query = (role === "admin" || role === "staff" || role === "manager") ? {} : { createdBy: managerId };
    const events = await Event.find(query).sort({ createdAt: -1 });

    // Derive "Ticket Sales" metrics from events
    const mapped = events.map(e => ({
      id: e._id.toString(),
      _id: e._id.toString(),
      eventId: e._id.toString(),
      eventName: e.title,
      title: "Standard Admission", // Defaulting since we're using event-level pricing
      price: e.price || 0,
      quantity: e.totalTickets || 0,
      sold: e.soldTickets || 0,
      revenue: (e.price || 0) * (e.soldTickets || 0),
      createdAt: e.createdAt,
      updatedAt: e.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Error fetching manager ticket metrics:", error);
    res.status(500).json({ message: "Failed to fetch ticket sales data" });
  }
};
