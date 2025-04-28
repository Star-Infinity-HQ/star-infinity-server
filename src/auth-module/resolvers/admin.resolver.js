import { PrismaClient } from "@prisma/client";
import { logger } from "../../shared/logger.js";

const prisma = new PrismaClient();

export const adminResolvers = {
    Query: {
        /**
         * GET - singular admin by their ID.
         * 
         * @param {*} _ - Parent resolver
         * @param {*} args - Arguments containing admin ID
         * @returns {Object} - Admin object
         */
        admin: async (_, { id }) => {
            try {
                const admin = await prisma.admin.findUnique({
                    where: { id: parseInt(id) }
                });

                return admin;
            } catch (error) {
                logger.error("Error fetching admin:", error);
                throw new Error("Failed to fetch admin");
            }
        },

        /**
         * GET - all available admins.
         * 
         * @returns {Array} - Array of admin objects
         */
        admins: async () => {
            try {
                const admins = await prisma.admin.findMany();
                return admins;
            } catch (error) {
                logger.error("Error fetching admins:", error);
                throw new Error("Failed to fetch admins");
            }
        }
    },

    Mutation: {
        /**
         * POST - Create a new admin.
         * 
         * @param {*} _ - Parent resolver
         * @param {*} args - Arguments containing admin data
         * @returns {Object} - Created admin object
         */
        createAdmin: async (_, { input }) => {
            try {
                const { username, email, password } = input;

                const existingAdmin = await prisma.admin.findUnique({
                    where: { email }
                });

                if (existingAdmin) {
                    throw new Error("Admin with this email already exists");
                }

                const admin = await prisma.admin.create({
                    data: {
                        username,
                        email,
                        password
                    }
                });

                return admin;
            } catch (error) {
                logger.error("Error creating admin:", error);
                throw new Error("Failed to create admin");
            }
        },

        /**
         * PUT - Update an existing admin.
         * 
         * @param {*} _ - Parent resolver
         * @param {*} args - Arguments containing admin data
         * @returns {Object} - Updated admin object
         */
        updateAdmin: async (_, { input }) => {
            try {
                const { id, username, email, password } = input;

                const existingAdmin = await prisma.admin.findUnique({
                    where: { id: parseInt(id) }
                });

                if (!existingAdmin) {
                    throw new Error("Admin not found");
                }

                const updatedAdmin = await prisma.admin.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...(username && { username }),
                        ...(email && { email }),
                        ...(password && { password })
                    }
                });

                return updatedAdmin;
            } catch (error) {
                logger.error("Error updating admin:", error);
                throw new Error("Failed to update admin");
            }
        },

        /**
         * DELETE - Delete an existing admin by ID.
         * 
         * @param {*} _ - Parent resolver
         * @param {*} args - Arguments containing admin ID
         * @returns {Boolean} - True if deletion was successful
         */
        deleteAdmin: async (_, { id }) => {
            try {
                const existingAdmin = await prisma.admin.findUnique({
                    where: { id: parseInt(id) }
                });

                if (!existingAdmin) {
                    throw new Error("Admin not found");
                }

                await prisma.admin.delete({
                    where: { id: parseInt(id) }
                });

                return true;
            } catch (error) {
                logger.error("Error deleting admin:", error);
                throw new Error("Failed to delete admin");
            }
        }
    }
};
