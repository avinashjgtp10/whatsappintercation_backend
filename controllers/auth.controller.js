const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const redisClient = require("../config/redis");
const logger = require("../utils/logger");
require("dotenv").config();

class AuthController {

    // =======================
    // REGISTER
    // =======================
    static async register(req, res) {
        try {
            const { full_name, name, email, organization, org, password, confirm, role } = req.body || {};

            if (password && confirm && password !== confirm) {
                return res.status(400).json({
                    status: "error",
                    message: "Passwords do not match",
                });
            }

            const user = await User.create({
                full_name: full_name || name || "Unnamed User",
                email: email || null,
                organization: organization || org || null,
                password: await bcrypt.hash(password || "temp1234", 10),
                role: role || "user",
                is_active: true,
            });

            logger.info(`User registered: ${user.id}`);

            res.status(201).json({
                status: "success",
                message: "User registered successfully",
                data: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                },
            });

        } catch (err) {
            logger.error(`Register error: ${err.message}`);
            res.status(500).json({
                status: "error",
                message: "Server error",
            });
        }
    }

    // =======================
    // LOGIN
    // =======================
    static async login(req, res) {
        try {
            const { email, password } = req.body || {};

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid email or password",
                });
            }

            const isMatch = await bcrypt.compare(password || "", user.password);

            if (!isMatch) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid email or password",
                });
            }

            const accessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: "15m" }
            );

            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

            await redisClient.set(user.id, refreshToken, {
                EX: 7 * 24 * 60 * 60,
            });

            logger.info(`User logged in: ${user.email}`);

            res.json({
                status: "success",
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user.id,
                        full_name: user.full_name,
                        email: user.email,
                        organization: user.organization,
                        role: user.role,
                    },
                },
            });

        } catch (err) {
            logger.error(`Login error: ${err.message}`);
            res.status(500).json({
                status: "error",
                message: "Server error",
            });
        }
    }

    // =======================
    // REFRESH TOKEN
    // =======================
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body || {};

            if (!refreshToken) {
                return res.status(400).json({
                    status: "error",
                    message: "Refresh token required",
                });
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            const storedToken = await redisClient.get(decoded.id);

            if (storedToken !== refreshToken) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid token",
                });
            }

            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found",
                });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: "15m" }
            );

            res.json({
                status: "success",
                data: {
                    accessToken: newAccessToken,
                },
            });

        } catch (err) {
            logger.error(`Refresh token error: ${err.message}`);
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });
        }
    }

    // =======================
    // LOGOUT
    // =======================
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body || {};

            if (!refreshToken) {
                return res.status(400).json({
                    status: "error",
                    message: "Refresh token required",
                });
            }

            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            await redisClient.del(decoded.id);

            logger.info(`User logged out: ${decoded.id}`);

            res.json({
                status: "success",
                message: "Logged out successfully",
            });

        } catch (err) {
            logger.error(`Logout error: ${err.message}`);
            res.status(500).json({
                status: "error",
                message: "Server error",
            });
        }
    }
}

module.exports = AuthController;
