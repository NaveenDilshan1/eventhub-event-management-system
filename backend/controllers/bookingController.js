import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import MasterUser from "../models/MasterUser.js";
import Payment from "../models/Payment.js";

const calculateBookingTotal = (tickets, pricePerTicket, discount = 0) => {
  let total = tickets * pricePerTicket;
  if (discount > 0) {
    total = total - (total * discount / 100);
  }
  console.log(`DEBUG: Booking total for ${tickets} tickets: ${total}`);
  return total;
};

export const bookTicket = async (req, res) => {
  try {
    const { eventId, quantity = 1, customTicketId, buyerName, buyerEmail, buyerPhone, paymentMethod, ticketType, discount = 0 } = req.body;

    // 🔹 Check user from JWT
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    // 🔹 Find user in masterusers collection
    const user = await MasterUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔎 Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const selectedTicketType = ticketType || "Standard";

    // 🎫 Check ticket availability in Tickets collection
    const ticket = await Ticket.findOne({ eventId, title: selectedTicketType });
    if (ticket) {
      if (ticket.quantity - (ticket.sold || 0) < quantity) {
        return res.status(400).json({ message: `Not enough ${selectedTicketType} tickets available` });
      }
    } else {
      // Fallback to event-level check if no specific ticket record exists
      const remaining = event.totalTickets - (event.soldTickets || 0);
      if (remaining < quantity) {
        return res.status(400).json({ message: "Not enough tickets available" });
      }
    }

    const finalBuyerName = buyerName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Guest";
    const finalBuyerEmail = buyerEmail || user.email || "guest@test.com";
    const finalBuyerPhone = buyerPhone || user.phone || "";

    const ticketPrice = ticket ? ticket.price : event.price;
    const totalAmount = calculateBookingTotal(quantity, ticketPrice, discount);

    // 💾 Create booking
    const booking = await Booking.create({
      user: user._id,
      eventId: event._id,
      buyerName: finalBuyerName,
      buyerEmail: finalBuyerEmail,
      buyerPhone: finalBuyerPhone,
      ticketTitle: selectedTicketType,
      price: ticketPrice,
      quantity,
      totalAmount,
      status: "Confirmed",
      customTicketId,
    });

    // 💳 Create Payment record
    await Payment.create({
      userId: user._id,
      eventId: event._id,
      amount: totalAmount,
      date: new Date(),
      method: paymentMethod || "Visa",
      status: "Completed",
      buyerName: finalBuyerName,
      customTicketId,
      ticketType: selectedTicketType,
      quantity: quantity,
    });

    // 📉 Update sold tickets in event
    event.soldTickets = (event.soldTickets || 0) + quantity;
    await event.save();

    // 📉 Update sold count in Tickets collection
    if (ticket) {
      ticket.sold = (ticket.sold || 0) + quantity;
      await ticket.save();
    }

    res.status(201).json({
      message: "Ticket booked successfully",
      booking,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};
// 📊 Get bookings for events owned by the calling manager
export const getManagerBookings = async (req, res) => {
  try {
    const managerId = req.user.id;

    // Find all events created by this manager
    const managerEvents = await Event.find({ createdBy: managerId }).select("_id");
    const eventIds = managerEvents.map(e => e._id);

    // Find all bookings for these events
    const bookings = await Booking.find({ eventId: { $in: eventIds } })
      .populate("eventId", "title")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching manager bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
