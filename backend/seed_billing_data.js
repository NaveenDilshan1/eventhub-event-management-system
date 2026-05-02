// backend/seed_billing_data.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Billing from "./models/Billing.js";
import Invoice from "./models/Invoice.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/event_management";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            dbName: "event_management"
        });
        console.log("Connected to MongoDB for seeding...");

        // 1. Seed Billing Plans
        await Billing.deleteMany({});
        const plans = [
            {
                plan: "Free Starter",
                amount: 0,
                currency: "INR",
                billingCycle: "month",
                status: "inactive",
                lastPaymentDate: null,
                nextPaymentDate: null
            },
            {
                plan: "Professional Plan",
                amount: 2500,
                currency: "INR",
                billingCycle: "month",
                status: "active",
                lastPaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                nextPaymentDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)  // 25 days from now
            },
            {
                plan: "Business Elite",
                amount: 7500,
                currency: "INR",
                billingCycle: "month",
                status: "inactive",
                lastPaymentDate: null,
                nextPaymentDate: null
            }
        ];
        await Billing.insertMany(plans);
        console.log("Billing plans seeded!");

        // 2. Seed Invoices
        await Invoice.deleteMany({});
        const invoices = [
            {
                plan: "Professional Plan",
                amount: 2500,
                currency: "INR",
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: "paid"
            },
            {
                plan: "Professional Plan",
                amount: 2500,
                currency: "INR",
                date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
                status: "paid"
            },
            {
                plan: "Professional Plan",
                amount: 2500,
                currency: "INR",
                date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
                status: "paid"
            },
            {
                plan: "Custom Enterprise",
                amount: 15000,
                currency: "INR",
                date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
                status: "paid"
            }
        ];
        await Invoice.insertMany(invoices);
        console.log("Invoice history seeded!");

        console.log("All billing data seeded successfully!");
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
