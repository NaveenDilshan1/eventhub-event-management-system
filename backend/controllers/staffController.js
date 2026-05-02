import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import ScanLog from "../models/ScanLog.js";
import SupportTicket from "../models/SupportTicket.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

/**
 * Get all events for staff view
 */
export const getStaffEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    const mapped = await Promise.all(events.map(async (e) => {
      // Calculate actual check-ins
      const [bookingCheckIns, attendeeCheckIns] = await Promise.all([
        Booking.countDocuments({ eventId: e._id, status: "CheckedIn" }),
        Attendee.countDocuments({ eventId: e._id, checkedIn: true })
      ]);

      const totalCheckedIn = bookingCheckIns + attendeeCheckIns;

      const eventDate = new Date(e.date);
      const isToday = eventDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);

      return {
        id: e._id.toString(),
        name: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        status: isToday ? "ongoing" : "upcoming",
        total: e.totalTickets || 0,
        checkedIn: totalCheckedIn
      };
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching staff events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all attendees for a specific event
 */
export const getEventAttendees = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Combine results from both Attendee and Booking for this event
    const [attendees, bookings] = await Promise.all([
      Attendee.find({ eventId }),
      Booking.find({ eventId, status: { $in: ["Confirmed", "CheckedIn"] } })
    ]);

    const mappedAttendees = [
      ...attendees.map(a => ({
        id: a._id.toString(),
        name: a.name,
        email: a.email,
        ticketType: a.ticketType || "Standard",
        ticketId: a.ticketId || "N/A",
        checkedIn: a.checkedIn || false,
        checkInTime: a.checkInTime || null,
        scanImageUrl: a.scanImageUrl || null,
      })),
      ...bookings.map(b => ({
        id: b._id.toString(),
        name: b.buyerName,
        email: b.buyerEmail,
        ticketType: b.ticketTitle || "Standard",
        ticketId: b.customTicketId || b._id.toString(),
        checkedIn: b.status === "CheckedIn",
        checkInTime: b.status === "CheckedIn" ? b.updatedAt : null,
        scanImageUrl: null,
      }))
    ];

    res.json({
      eventName: event.title,
      attendees: mappedAttendees,
    });
  } catch (err) {
    console.error("Error fetching attendees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Scan ticket / check-in attendee
 */
export const scanTicket = async (req, res) => {
  const { qrData } = req.body;
  const file = req.file;

  if (!qrData) {
    return res.status(400).json({ message: "QR data missing" });
  }

  let ticketId = qrData;
  let type = null;

  if (qrData.startsWith("{") && qrData.endsWith("}")) {
    try {
      const parsed = JSON.parse(qrData);
      ticketId = parsed.id || qrData;
    } catch (e) { }
  } else {
    const parts = qrData.split("|");
    ticketId = parts[0];
    type = parts[1];
  }

  try {
    const isId = mongoose.Types.ObjectId.isValid(ticketId);

    // 0. Try Support Ticket first (Manual Entry/Support Pass)
    const supportPass = await SupportTicket.findById(isId ? ticketId : new mongoose.Types.ObjectId()).catch(() => null);
    if (supportPass) {
      // If it's a support ticket, it's a valid manual entry pass
      const log = await ScanLog.create({
        ticketId: supportPass._id.toString(),
        name: supportPass.attendee,
        type: "Support Pass",
        status: "success"
      });

      return res.json({
        message: "Check-in successful (Support Pass)",
        scan: {
          id: log._id,
          name: supportPass.attendee,
          ticketId: supportPass._id.toString(),
          type: "Support Pass",
          status: "success",
        },
      });
    }

    // 1. Try Booking
    let booking = await Booking.findOne({
      $or: [
        { _id: isId ? ticketId : new mongoose.Types.ObjectId() },
        { customTicketId: ticketId }
      ]
    });

    if (booking) {
      if (booking.status === "CheckedIn") {
        await ScanLog.create({
          ticketId: booking.customTicketId || booking._id,
          name: booking.buyerName,
          type: booking.ticketTitle || "Standard",
          status: "failed",
          message: "Already scanned"
        });
        return res.status(400).json({ message: "Ticket already used for entry" });
      }

      booking.status = "CheckedIn";
      await booking.save();

      // 📝 Create a permanent record in Attendee collection ONLY after successful scan
      await Attendee.create({
        name: booking.buyerName,
        email: booking.buyerEmail,
        phone: booking.buyerPhone,
        ticketType: booking.ticketTitle || "Standard",
        status: "CheckedIn",
        registeredAt: booking.createdAt,
        eventId: booking.eventId,
        checkedIn: true,
        checkInTime: new Date()
      });

      const log = await ScanLog.create({
        ticketId: booking.customTicketId || booking._id,
        name: booking.buyerName,
        type: booking.ticketTitle || "Standard",
        status: "success"
      });

      return res.json({
        message: "Check-in successful",
        scan: {
          id: log._id,
          name: booking.buyerName,
          ticketId: booking.customTicketId || booking._id,
          type: booking.ticketTitle || "Standard",
          status: "success",
        },
      });
    }

    // 2. Try Attendee
    let query = { ticketId };
    if (type) query.ticketType = type;

    let attendee = await Attendee.findOne(query);
    if (!attendee) {
      const attendeeByRef = await Attendee.findById(isId ? ticketId : new mongoose.Types.ObjectId()).catch(() => null);
      if (attendeeByRef) attendee = attendeeByRef;
    }

    if (attendee) {
      if (attendee.checkedIn) {
        await ScanLog.create({
          ticketId: attendee.ticketId || attendee._id,
          name: attendee.name,
          type: attendee.ticketType || "Standard",
          status: "failed",
          message: "Already scanned"
        });
        return res.status(400).json({ message: "Ticket already used for entry" });
      }

      attendee.checkedIn = true;
      attendee.checkInTime = new Date();
      if (file) attendee.scanImageUrl = `/uploads/scans/${file.filename}`;
      await attendee.save();

      const log = await ScanLog.create({
        ticketId: attendee.ticketId || attendee._id,
        name: attendee.name,
        type: attendee.ticketType || "Standard",
        status: "success"
      });

      return res.json({
        message: "Check-in successful",
        scan: {
          id: log._id,
          name: attendee.name,
          ticketId: attendee.ticketId || attendee._id,
          type: attendee.ticketType,
          status: "success",
        },
      });
    }

    // 3. Not Found
    await ScanLog.create({
      ticketId: ticketId,
      name: "Unknown",
      type: "-",
      status: "failed",
      message: "Invalid Ticket"
    });
    return res.status(404).json({ message: "Invalid Ticket: No matching booking or attendee found" });

  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get recent scans from ScanLog
 */
export const getRecentScans = async (req, res) => {
  try {
    const logs = await ScanLog.find()
      .sort({ time: -1 })
      .limit(20);

    const mapped = logs.map(l => ({
      id: l._id.toString(),
      name: l.name,
      ticketId: l.ticketId,
      type: l.type,
      time: new Date(l.time).toLocaleTimeString(),
      status: l.status,
      message: l.message
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching recent scans:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a scan log entry
 */
export const deleteScanLog = async (req, res) => {
  try {
    const { id } = req.params;
    await ScanLog.findByIdAndDelete(id);
    res.json({ message: "Scan record deleted" });
  } catch (err) {
    console.error("Delete scan log error:", err);
    res.status(500).json({ message: "Failed to delete scan record" });
  }
};

/**
 * Get all support tickets
 */
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ time: -1 });
    const mapped = tickets.map(t => ({
      id: t._id.toString(),
      issue: t.issue,
      description: t.description,
      attendee: t.attendee,
      status: t.status,
      time: t.time,
      ticketId: t.ticketId,
      eventName: t.eventName
    }));
    res.json(mapped);
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create a new support ticket
 */
export const createSupportTicket = async (req, res) => {
  let { attendee, issueType, description, ticketId, eventName } = req.body;

  if (!attendee || !issueType || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // If ticketId is missing, try to find a linked booking automatically
    if (!ticketId) {
      const linkedBooking = await Booking.findOne({ buyerName: attendee }).sort({ createdAt: -1 });
      if (linkedBooking) {
        ticketId = linkedBooking.customTicketId || linkedBooking._id.toString();
        const linkedEvent = await Event.findById(linkedBooking.eventId);
        eventName = linkedEvent?.title || "";
      }
    }

    const newTicket = await SupportTicket.create({
      attendee,
      issue: issueType, // Mapping issueType from frontend to issue in schema
      description,
      ticketId,
      eventName,
      status: "open",
      time: new Date()
    });

    res.status(201).json({
      id: newTicket._id.toString(),
      issue: newTicket.issue,
      description: newTicket.description,
      attendee: newTicket.attendee,
      status: newTicket.status,
      time: newTicket.time,
      ticketId: newTicket.ticketId,
      eventName: newTicket.eventName
    });
  } catch (err) {
    console.error("Error creating support ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Search for attendees or bookings by name
 */
export const searchAttendee = async (req, res) => {
  const { name } = req.query;

  if (!name || name.length < 3) {
    return res.status(400).json({ message: "Please enter at least 3 characters" });
  }

  try {
    // Search in Booking
    const bookings = await Booking.find({
      buyerName: { $regex: name, $options: "i" },
      status: { $in: ["Confirmed", "CheckedIn"] }
    }).populate("eventId", "title date location");

    // Search in Attendee
    const attendees = await Attendee.find({
      name: { $regex: name, $options: "i" }
    });

    const results = [
      ...bookings.map(b => ({
        id: b.customTicketId || b._id.toString(),
        name: b.buyerName,
        email: b.buyerEmail,
        ticketType: b.ticketTitle || "Standard",
        eventName: b.eventId?.title || "N/A",
        date: b.eventId?.date,
        location: b.eventId?.location,
        status: b.status,
        type: 'booking'
      })),
      ...attendees.map(a => ({
        id: a.ticketId || a._id.toString(),
        name: a.name,
        email: a.email,
        ticketType: a.ticketType || "Standard",
        eventName: "N/A",
        status: a.checkedIn ? "CheckedIn" : "Confirmed",
        type: 'attendee'
      }))
    ];

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * Get live check-in statistics
 */
export const getLiveStats = async (req, res) => {
  try {
    const events = await Event.find();
    const totalCapacity = events.reduce((acc, e) => acc + (e.totalTickets || 0), 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const successfulScansToday = await ScanLog.countDocuments({
      status: "success",
      time: { $gte: startOfToday }
    });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastFiveMinScans = await ScanLog.countDocuments({
      status: "success",
      time: { $gte: fiveMinutesAgo }
    });
    const perMinute = Math.round(lastFiveMinScans / 5) || 0;

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const trendLogs = await ScanLog.find({
      status: "success",
      time: { $gte: sixHoursAgo }
    }).sort({ time: 1 });

    const trendMap = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourLabel = `${d.getHours()}:00`;
      trendMap[hourLabel] = 0;
    }

    trendLogs.forEach(log => {
      const hour = `${new Date(log.time).getHours()}:00`;
      if (trendMap[hour] !== undefined) trendMap[hour]++;
    });

    const checkInTrend = Object.keys(trendMap).sort().map(time => ({
      time,
      count: trendMap[time]
    }));

    const zoneLabels = ["VIP", "Standard", "General", "Support Pass"];
    const zones = await Promise.all(zoneLabels.map(async label => {
      const currentInZone = await ScanLog.countDocuments({
        status: "success",
        type: { $regex: label, $options: "i" }
      });

      const capacity = label === "Standard" ? Math.floor(totalCapacity * 0.6) : Math.floor(totalCapacity * 0.1) || 50;

      return {
        name: label,
        current: currentInZone,
        capacity: capacity || 100
      };
    }));

    res.json({
      totalCapacity,
      checkedIn: successfulScansToday,
      perMinute,
      checkInTrend,
      zones
    });
  } catch (err) {
    console.error("Live stats error:", err);
    res.status(500).json({ message: "Failed to fetch live stats" });
  }
};

/**
 * Delete a support ticket
 */
export const deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    await SupportTicket.findByIdAndDelete(id);
    res.json({ message: "Support ticket deleted successfully" });
  } catch (err) {
    console.error("Delete support ticket error:", err);
    res.status(500).json({ message: "Failed to delete ticket" });
  }
};
