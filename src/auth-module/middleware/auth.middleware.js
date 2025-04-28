import { verifyToken } from "../../shared/auth.js";
import { logger } from "../../shared/logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Authentication middleware for GraphQL context.
 * 
 * @param {Object} req - Express request object
 * @returns {Object} - GraphQL context object
 */
export const authMiddleware = async ({ req }) => {
    const token = req.headers.authorization?.split(" ")[1] || "";

    if (!token) {
        return { user: null };
    }

    try {
        const { valid, user } = await verifyToken(token);

        if (!valid || !user) {
            return { user: null };
        }

        let role = "STUDENT";
        let userId = null;

        const admin = await prisma.admin.findUnique({
            where: { email: user.email }
        });

        if (admin) {
            role = "ADMIN";
            userId = admin.id;
        } else {
            const instructor = await prisma.instructor.findUnique({
                where: { email: user.email }
            });

            if (instructor) {
                role = "INSTRUCTOR";
                userId = instructor.id;
            }
        }

        return {
            user: {
                id: userId?.toString(),
                email: user.email,
                role
            }
        };
    } catch (error) {
        logger.error("Authentication middleware error:", error);
        return { user: null };
    }
};

/**
 * Authorization middleware to check if user has required role.
 * 
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
export const requireAuth = (allowedRoles = []) => {
    return (next) => (root, args, context, info) => {
        if (!context.user) {
            throw new Error("Authentication required");
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(context.user.role)) {
            throw new Error("Not authorized");
        }

        return next(root, args, context, info);
    };
};
