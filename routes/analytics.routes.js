const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/analytics.controller");

// Route: /api/analytics/
router.get("/", getDashboardAnalytics);

module.exports = router;
