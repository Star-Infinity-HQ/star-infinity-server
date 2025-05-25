import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const dbConfig = {
    url: process.env.DEV_DATABASE_URL || process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL || process.env.DEV_DATABASE_URL || process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || "10"),
    connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "30000"),
    idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || "10000")
};

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbConfig.url
        }
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        return prisma;
    } catch (error) {
        console.error("Failed to connect to database:", error);
        throw error;
    }
};

export const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
    } catch (error) {
        console.error("Failed to disconnect from database:", error);
        throw error;
    }
};
