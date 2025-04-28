import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logger } from "../../shared/logger.js";

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        logger.error("Error hashing password:", error);
        throw new Error("Failed to hash password");
    }
};

/**
 * Compare a password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {boolean} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        logger.error("Error comparing passwords:", error);
        throw new Error("Failed to compare passwords");
    }
};

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT token
 */
export const generateToken = (payload, expiresIn = "1d") => {
    try {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    } catch (error) {
        logger.error("Error generating token:", error);
        throw new Error("Failed to generate token");
    }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Token payload
 */
export const verifyJwtToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        logger.error("Error verifying token:", error);
        throw new Error("Invalid token");
    }
};
