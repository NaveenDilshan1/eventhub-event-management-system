import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

// Get all attendees (Unified across Attendee and Booking collections)
export const getAllAttendees = async (req, res) => {
  try {
    const attendeesList = await Attendee.find();
    const bookingsList = await Booking.find();

    const unified = [
      ...attendeesList.map(a => ({
        _id: a._id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        ticketType: a.ticketType,
        status: a.checkedIn ? "CheckedIn" : a.status || "Confirmed",
        registeredAt: a.registeredAt || a.createdAt,
        eventId: a.eventId.toString(),
        source: "Attendee"
      })),
      ...bookingsList.map(b => ({
        _id: b._id,
        name: b.buyerName,
        email: b.buyerEmail,
        phone: b.buyerPhone,
        ticketType: b.ticketTitle,
        status: b.status, // "CheckedIn" or "Confirmed"
        registeredAt: b.createdAt,
        eventId: b.eventId.toString(),
        source: "Booking"
      }))
    ];

    res.json({ attendees: unified });
  } catch (err) {
    console.error("Error in getAllAttendees:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get attendees by eventId
export const getAttendeesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendees = await Attendee.find({ eventId });
    const bookings = await Booking.find({ eventId });

    const combined = [
      ...attendees.map(a => ({ ...a._doc, id: a._id, source: "Attendee" })),
      ...bookings.map(b => ({
        ...b._doc,
        id: b._id,
        name: b.buyerName,
        email: b.buyerEmail,
        status: b.status,
        source: "Booking"
      }))
    ];

    res.json({ attendees: combined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update attendee info
export const updateAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    // Try updating Attendee first
    let updated = await Attendee.findByIdAndUpdate(id, req.body, { new: true });

    // If not found, try updating Booking (since we unified them in view)
    if (!updated) {
      updated = await Booking.findByIdAndUpdate(id, {
        buyerName: req.body.name,
        buyerEmail: req.body.email
      }, { new: true });
    }

    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update record" });
  }
};

// Mock send emails
export const sendEmailsToAttendees = async (req, res) => {
  try {
    const { attendees } = req.body;
    if (!attendees || attendees.length === 0) {
      return res.status(400).json({ message: "No attendees provided" });
    }
    console.log("Sending emails to:", attendees);
    res.status(200).json({ message: "Emails sent successfully", count: attendees.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to send emails" });
  }
};

// Check-in attendee
export const checkInAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    // Check-in logic for either model
    let record = await Attendee.findByIdAndUpdate(id, { checkedIn: true, checkInTime: new Date() }, { new: true });
    if (!record) {
      record = await Booking.findByIdAndUpdate(id, { status: "CheckedIn" }, { new: true });
    }

    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Check-in failed" });
  }
};

// 📊 Get attendees for events owned by the calling manager
export const getManagerAttendees = async (req, res) => {
  try {
    const managerId = req.user.id;
    const role = req.user.role;

    const managerEvents = await Event.find(role === "admin" || role === "staff" || role === "manager" ? {} : { createdBy: managerId }).select("_id");
    const eventIds = managerEvents.map(e => e._id.toString());

    if (eventIds.length === 0 && role !== "admin" && role !== "staff" && role !== "manager") {
      return res.json({ attendees: [] });
    }

    const query = (role === "admin" || role === "staff" || role === "manager") ? {} : { eventId: { $in: eventIds } };

    const [attendees, bookings] = await Promise.all([
      Attendee.find(query).sort({ registeredAt: -1 }),
      Booking.find(query).sort({ createdAt: -1 })
    ]);

    const unified = [
      ...attendees
        .filter(a => a.checkedIn) // Only show checked-in attendees
        .map(a => ({
          _id: a._id,
          id: a._id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          ticketType: a.ticketType,
          status: "CheckedIn",
          registeredAt: a.registeredAt || a.createdAt,
          eventId: a.eventId.toString(),
          source: "Attendee"
        })),
      ...bookings
        .filter(b => b.status === "CheckedIn") // Only show checked-in bookings
        .map(b => ({
          _id: b._id,
          id: b._id,
          name: b.buyerName,
          email: b.buyerEmail,
          phone: b.buyerPhone,
          ticketType: b.ticketTitle,
          status: "CheckedIn",
          registeredAt: b.createdAt,
          eventId: b.eventId.toString(),
          source: "Booking"
        }))
    ];

    res.json({ attendees: unified });
  } catch (err) {
    console.error("Error fetching manager attendees:", err);
    res.status(500).json({ message: "Failed to fetch attendees" });
  }
};

// Delete attendee (from either model)
export const deleteAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = await Attendee.findByIdAndDelete(id);
    if (!deleted) {
      deleted = await Booking.findByIdAndDelete(id);
    }

    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Attendee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete attendee" });
  }
};
