require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const authMiddleware = require("./middleware/auth.middleware");
const logger = require("./utils/logger");


const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Protected route example
//const authMiddleware = require("./middleware/auth.middleware");
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
});

// Analytics routes


app.use("/api/analytics", authMiddleware, analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    logger.error(`${req.method} ${req.url} - ${statusCode}: ${message}`);

    res.status(statusCode).json({
        status: "error",
        message: statusCode === 400 ? "Bad Request: " + message : message
    });
});

// Start server
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
    console.log("Database synced");
}).catch(err => console.error("DB connection error:", err));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the existing process.`);
        process.exit(1);
    } else {
        console.error("Server start error:", err);
    }
});
