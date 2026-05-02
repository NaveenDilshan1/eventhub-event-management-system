// backend/sync_tickets.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Ticket from "./models/Ticket.js";
import Booking from "./models/Booking.js";
import Event from "./models/Event.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI not found in .env");
    process.exit(1);
}

const sync = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI, {
            dbName: "event_management"
        });
        console.log("✅ Connected to event_management database.");

        // 1. Find all events and ensure they have at least one Ticket record
        const events = await Event.find({});
        console.log(`🔍 Checking ${events.length} events for missing ticket records...`);

        for (const event of events) {
            const ticketCount = await Ticket.countDocuments({ eventId: event._id });
            if (ticketCount === 0) {
                console.log(`🪄 Creating missing "Standard" ticket for event: ${event.title}`);
                await Ticket.create({
                    title: "Standard",
                    price: event.price || 0,
                    quantity: event.totalTickets || 0,
                    description: "Standard Admission",
                    eventId: event._id,
                    sold: 0
                });
            }
        }

        // 2. Fetch all tickets and sync their sold counts
        console.log("🔍 Fetching all tickets for sync...");
        const tickets = await Ticket.find({});
        console.log(`Found ${tickets.length} tickets. Syncing sold counts...`);

        let updatedCount = 0;

        for (const ticket of tickets) {
            // Find all bookings for this specific ticket type and event
            // Note: We match by eventId AND title (or "Standard" as fallback)
            const bookings = await Booking.find({
                eventId: ticket.eventId,
                status: { $ne: "cancelled" }
            });

            // Calculate total sold for this ticket type
            // Some old bookings might have empty ticketTitle, we treat them as "Standard"
            const totalSold = bookings
                .filter(b => {
                    const bTitle = b.ticketTitle || "Standard";
                    return bTitle === ticket.title;
                })
                .reduce((sum, b) => sum + (b.quantity || 1), 0);

            if (ticket.sold !== totalSold) {
                ticket.sold = totalSold;
                await ticket.save();
                updatedCount++;
                console.log(`✅ Updated "${ticket.title}" for event ${ticket._id}: Sold = ${totalSold}`);
            }
        }

        console.log(`\n🎉 SYNC COMPLETED: ${updatedCount} tickets updated.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ SYNC FAILED:", err);
        process.exit(1);
    }
};

sync();
