import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

/**
 * ================= ADMIN & MANAGER =================
 */

/**
 * Create a new event (Manager)
 */
export const createEvent = async (req, res) => {
  try {
    const { name, description, category, date, time, location, link, ticketTypes, isOnline } = req.body;

    // Validate required fields
    if (!name || !date) {
      return res.status(400).json({ message: "Event name and date are required" });
    }

    let imageUrl = null;

    // Handle image upload if file exists
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }

    const parsedTicketTypes = typeof ticketTypes === "string" ? JSON.parse(ticketTypes) : ticketTypes || [];

    const event = await Event.create({
      title: name,
      description: description || "",
      category: category || "Other",
      date,
      time: time || "",
      location: isOnline ? (link || "") : (location || ""),
      status: "draft",
      createdBy: req.user.id,
      imageUrl,
      totalTickets: parsedTicketTypes.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0),
      price: parsedTicketTypes?.[0]?.price || 0,
      soldTickets: 0,
    });

    // 🎫 Create entries in the Tickets collection
    if (parsedTicketTypes.length > 0) {
      const ticketRecords = parsedTicketTypes.map(t => ({
        title: t.name || t.title || "Standard",
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 0,
        description: t.description || "",
        eventId: event._id,
        sold: 0
      }));
      await Ticket.insertMany(ticketRecords);
    }

    res.status(201).json({
      message: "Event created successfully",
      event: {
        ...event._doc,
        id: event._id.toString(),
      },
    });
  } catch (err) {
    console.error("Error in createEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all events (Admin)
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "firstName lastName email");

    const eventsWithImages = events.map(e => ({
      ...e._doc,
      imageUrl: e.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
      id: e._id.toString(),
    }));

    res.json(eventsWithImages);
  } catch (err) {
    console.error("Error in getAllEvents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get manager's own events
 */
export const getManagerEvents = async (req, res) => {
  try {
    let query = { createdBy: req.user.id };

    // If admin, staff or manager, show ALL events
    if (req.user.role === "admin" || req.user.role === "staff" || req.user.role === "manager") {
      query = {};
    }

    const events = await Event.find(query).populate("createdBy", "firstName lastName email");

    const eventsWithImages = events.map(e => ({
      ...e._doc,
      imageUrl: e.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
      id: e._id.toString(),
    }));

    res.json(eventsWithImages);
  } catch (err) {
    console.error("Error in getManagerEvents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single event by ID (Admin & Manager)
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("createdBy", "firstName lastName email");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({
      ...event._doc,
      imageUrl: event.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
      id: event._id.toString(),
    });
  } catch (err) {
    console.error("Error in getEventById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete an event (Admin or Creator only)
 */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check ownership - admin/staff/manager can delete any
    const isOwner = event.createdBy && event.createdBy.toString() === req.user.id.toString();
    const isPrivilegedRole = req.user.role === "admin" || req.user.role === "staff" || req.user.role === "manager";

    if (!isPrivilegedRole && !isOwner) {
      return res.status(403).json({ message: "Forbidden: Cannot delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error in deleteEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update an event (Admin or Creator only)
 */
export const updateEvent = async (req, res) => {
  try {
    const { title, name, description, date, time, location, status, imageUrl, totalTickets, price, category } = req.body;
    const { id } = req.params;

    console.log("--- UPDATE EVENT DEBUG ---");
    console.log("Event ID:", id);
    console.log("User ID:", req.user.id);
    console.log("Received Body:", req.body);

    const eventTitle = title || name;
    const event = await Event.findById(id);
    if (!event) {
      console.log("Result: Event not found");
      return res.status(404).json({ message: "Event not found" });
    }

    // Check ownership
    const isOwner = event.createdBy && event.createdBy.toString() === req.user.id.toString();
    const isPrivilegedRole = req.user.role === "admin" || req.user.role === "staff" || req.user.role === "manager";

    console.log("Owner Check:", { isOwner, isPrivilegedRole, createdBy: event.createdBy });

    if (!isPrivilegedRole && !isOwner && event.createdBy) {
      console.log("Result: Forbidden");
      return res.status(403).json({ message: "Forbidden: Cannot edit this event" });
    }

    let updatedImageUrl = imageUrl;
    if (req.file) {
      updatedImageUrl = `/uploads/events/${req.file.filename}`;
      console.log("New image uploaded:", updatedImageUrl);
    }

    const updateData = {};
    if (eventTitle !== undefined) updateData.title = eventTitle;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (updatedImageUrl !== undefined) updateData.imageUrl = updatedImageUrl;
    if (totalTickets !== undefined) updateData.totalTickets = Number(totalTickets);
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;

    console.log("Update Object:", updateData);

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      console.log("Result: Update failed at findByIdAndUpdate");
      return res.status(400).json({ message: "Update failed: Event not found or invalid data" });
    }

    // 🔄 Handle CANCELLATION logic (Refunds & Notifications)
    if (status === "cancelled") {
      console.log("--- EVENT CANCELLED: Processing Refunds ---");

      // 1. Find all bookings for this event
      const bookings = await Booking.find({ eventId: id });

      if (bookings.length > 0) {
        // 2. Update all bookings to 'Refunded'
        await Booking.updateMany({ eventId: id }, { $set: { status: "Refunded" } });

        // 3. Update all payments to 'Refunded'
        await Payment.updateMany({ eventId: id }, { $set: { status: "Refunded" } });

        // 4. Create notifications for buyers
        const notifications = bookings.map(booking => ({
          userId: booking.user,
          title: "Event Cancelled & Money Refunded",
          message: `The event "${updatedEvent.title}" has been cancelled. Your payment of ${updatedEvent.price * booking.quantity} has been refunded to your original payment method.`,
          type: "warning"
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log(`Created ${notifications.length} notifications for cancelled event.`);
        }
      }
    }

    console.log("Result: Success");
    res.json({
      message: status === "cancelled" ? "Event cancelled and refunds processed" : "Event updated successfully",
      event: {
        ...updatedEvent._doc,
        id: updatedEvent._id.toString(),
        imageUrl: updatedEvent.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
      },
    });
  } catch (err) {
    console.error("Critical Error in updateEvent:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * ================= PUBLIC EVENTS =================
 */

/**
 * Get all public events
 */
export const getPublicEvents = async (req, res) => {
  try {
    // Show ALL events regardless of status for public API debugging
    const events = await Event.find({}).select(
      "title description date time location price category imageUrl totalTickets soldTickets status"
    );

    const formatted = events.map(e => ({
      ...e._doc,
      id: e._id.toString(),
      imageUrl: e.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching public events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get single public event by ID
 */
export const getPublicEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select(
      "title description date time location price category imageUrl totalTickets soldTickets"
    );

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({
      ...event._doc,
      id: event._id.toString(),
      imageUrl: event.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
    });
  } catch (err) {
    console.error("Error fetching public event:", err);
    res.status(500).json({ message: "Server error" });
  }
};
