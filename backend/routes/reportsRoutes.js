import express from "express";
import { getMonthlyRevenue, getEventCategories } from "../controllers/reportsController.js";

const router = express.Router();

router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/event-categories", getEventCategories);



export default router;
