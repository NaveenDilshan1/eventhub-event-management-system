import express from "express";
import axios from "axios";

const router = express.Router();
const PYTHON_SERVICE_URL = "http://localhost:5001/api/python";

// POST: Ask AI (Bridges to Python)
router.post("/ask", async (req, res) => {
  try {
    const { prompt, role, history } = req.body;

    // Call Python Service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/ask`, {
      prompt,
      role,
      history
    });

    res.json(response.data);
  } catch (err) {
    console.error("AI BRIDGE ERROR:", err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "Python AI service is not running. Please start the Python service on port 5001."
      });
    }
    res.status(500).json({ error: "Failed to process AI query through Python service" });
  }
});

// GET: Fetch AI history (Bridges to Python)
router.get("/history", async (req, res) => {
  try {
    const { role } = req.query;
    const response = await axios.get(`${PYTHON_SERVICE_URL}/history`, {
      params: { role }
    });

    res.json(response.data);
  } catch (err) {
    console.error("AI HISTORY BRIDGE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch AI history from Python service" });
  }
});

export default router;
