// backend/diagnose_sync.js
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const run = async () => {
    await mongoose.connect(MONGO_URI, { dbName: "event_management" });
    const db = mongoose.connection.db;

    const tickets = await db.collection("tickets").find().toArray();
    const bookings = await db.collection("bookings").find().toArray();

    console.log(`Total Tickets: ${tickets.length}`);
    console.log(`Total Bookings: ${bookings.length}`);

    console.log("\n--- Tickets ---");
    tickets.forEach(t => {
        console.log(`Event: ${t.eventId} | Title: "${t.title}" | Sold: ${t.sold}`);
    });

    console.log("\n--- Bookings ---");
    bookings.forEach(b => {
        console.log(`Event: ${b.eventId} | Title: "${b.ticketTitle}" | Qty: ${b.quantity}`);
    });

    process.exit(0);
};

run();
