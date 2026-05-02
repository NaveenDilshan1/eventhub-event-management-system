import Billing from "../models/Billing.js";
import Invoice from "../models/Invoice.js";

// GET ALL BILLING PLANS
export const getBillingPlans = async (req, res) => {
  try {
    const plans = await Billing.find({}); // 🔴 NO CONDITIONS
    console.log("Billing plans from DB:", plans); // DEBUG

    res.status(200).json(plans);
  } catch (error) {
    console.error("Billing fetch error:", error);
    res.status(500).json({ message: "Failed to fetch billing plans" });
  }
};

// UPGRADE PLAN
export const upgradePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Set all others to inactive
    await Billing.updateMany({ _id: { $ne: id } }, { status: "inactive" });

    // Set selected to active and update dates
    const updatedPlan = await Billing.findByIdAndUpdate(id, {
      status: "active",
      lastPaymentDate: new Date(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }, { new: true });

    // Create a corresponding invoice
    if (updatedPlan) {
      await Invoice.create({
        plan: updatedPlan.plan,
        amount: updatedPlan.amount,
        currency: updatedPlan.currency || "INR",
        date: new Date(),
        status: "paid"
      });
    }

    res.status(200).json({ message: "Plan upgraded successfully" });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ message: "Upgrade failed" });
  }
};
