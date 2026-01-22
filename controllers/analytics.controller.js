// controllers/analytics.controller.js

const logger = require("../utils/logger");

/**
 * GET /api/analytics
 * Returns dashboard analytics data.
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    // Simulated dashboard data
    const dashboardData = {
      stats: {
        total_messages: 1240,
        messages_change: 12,
        total_contacts: 320,
        contacts_change: 8,
        chatbot_sessions: 87,
        chatbot_change: 5,
        campaigns_sent: 12,
        campaigns_change: 3,
      },
      recent_messages: [
        {
          id: 1,
          name: "Amit Sharma",
          message: "Hi, I need help with pricing",
          time: "2 min ago",
        },
        {
          id: 2,
          name: "Priya Singh",
          message: "Can I schedule a demo?",
          time: "10 min ago",
        },
      ],
    };

    // Send response
    res.json({
      status: "success",
      data: dashboardData,
    });
  } catch (err) {
    logger.error("Error in getDashboardAnalytics:", err.message);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

module.exports = {
  getDashboardAnalytics,
};
