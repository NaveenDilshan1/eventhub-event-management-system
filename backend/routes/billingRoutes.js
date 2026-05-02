import express from "express";
import { getBillingPlans, upgradePlan } from "../controllers/billingController.js";

const router = express.Router();

router.get("/plans", getBillingPlans);
router.put("/upgrade/:id", upgradePlan);

export default router;
