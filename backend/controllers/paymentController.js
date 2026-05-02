import Payment from "../models/Payment.js";
import MasterUser from "../models/MasterUser.js";
import Event from "../models/Event.js";
import PaymentMethod from "../models/PaymentMethod.js";

/* =============================
   GET USER PAYMENTS
============================= */

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id; // From protect middleware

    const payments = await Payment.find({ userId })
      .populate("eventId", "title")
      .sort({ date: -1 });

    const mapped = payments.map(p => {
      // Handle populated eventId safely
      const eventTitle = p.eventId && p.eventId.title ? p.eventId.title : "Unknown Event";

      return {
        _id: p._id,
        date: p.date,
        amount: p.amount || 0,
        method: p.method || "Visa",
        status: p.status || "Completed",
        eventName: eventTitle,
        buyerName: p.buyerName || "N/A",
        customTicketId: p.customTicketId || "N/A",
        ticketType: p.ticketType || "Standard",
        quantity: p.quantity || 1,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

/* =============================
   GET USER PAYMENT METHODS
============================= */

export const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const methods = await PaymentMethod.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json(
      methods.map(m => ({
        id: m._id,
        brand: m.brand,
        last4: m.last4,
        expMonth: m.expMonth,
        expYear: m.expYear,
        cardHolderName: m.cardHolderName,
        isDefault: m.isDefault,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payment methods" });
  }
};

/* =============================
   ADD PAYMENT METHOD
============================= */

export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      brand,
      last4,
      expMonth,
      expYear,
      cardHolderName,
      isDefault,
    } = req.body;

    if (
      !brand ||
      !last4 ||
      !expMonth ||
      !expYear ||
      !cardHolderName
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (isDefault) {
      await PaymentMethod.updateMany(
        { userId },
        { isDefault: false }
      );
    }

    const method = await PaymentMethod.create({
      userId,
      brand,
      last4,
      expMonth,
      expYear,
      cardHolderName,
      isDefault,
    });

    res.status(201).json(method);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save card" });
  }
};

/* =============================
   DELETE PAYMENT METHOD
============================= */
export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const method = await PaymentMethod.findOneAndDelete({ _id: id, userId });
    if (!method) return res.status(404).json({ message: "Card not found" });

    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete card" });
  }
};
