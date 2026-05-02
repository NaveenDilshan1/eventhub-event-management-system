import Invoice from "../models/Invoice.js";

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).sort({ date: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};
