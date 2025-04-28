import { supabase, verifyToken, refreshToken as refreshAuthToken } from "../../shared/auth.js";
import { logger } from "../../shared/logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authResolvers = {
  Query: {
    /**
     * GET - current authenticated user information.
     * 
     * @param {*} _ - Parent resolver
     * @param {*} __ - Arguments
     * @param {*} context - GraphQL context containing user information
     * @returns {Object} - User object
     */
    me: async (_, __, context) => {
      try {
        if (!context.user) {
          return null;
        }

        if (context.user.role === "ADMIN") {
          const admin = await prisma.admin.findUnique({
            where: { id: parseInt(context.user.id) }
          });

          return {
            id: admin.id.toString(),
            email: admin.email,
            role: "ADMIN"
          };
        } else if (context.user.role === "INSTRUCTOR") {
          const instructor = await prisma.instructor.findUnique({
            where: { id: parseInt(context.user.id) }
          });

          return {
            id: instructor.id.toString(),
            email: instructor.email,
            role: "INSTRUCTOR"
          };
        }

        return null;
      } catch (error) {
        logger.error("Error fetching current user:", error);
        throw new Error("Failed to fetch current user");
      }
    },

    /**
     * VERIFY - If the token is a valid token or not.
     * 
     * @param {*} _ - Parent resolver
     * @param {*} args - Arguments containing token
     * @returns {Boolean} - True if token is valid, false otherwise
     */
    verifyToken: async (_, { token }) => {
      try {
        const { valid } = await verifyToken(token);
        return valid;
      } catch (error) {
        logger.error("Error verifying token:", error);
        return false;
      }
    }
  },

  Mutation: {
    /**
     * POST - Authenticate a user and return an authentication token.
     * 
     * @param {*} _ - Parent resolver
     * @param {*} args - Arguments containing login input
     * @returns {Object} - Auth object containing token and user
     */
    login: async (_, { input }) => {
      try {
        const { email, password } = input;

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          logger.error("Login error:", error);
          throw new Error("Invalid email or password");
        }

        let role = "STUDENT";
        let userId = null;

        const admin = await prisma.admin.findUnique({
          where: { email }
        });

        if (admin) {
          role = "ADMIN";
          userId = admin.id;
        } else {
          const instructor = await prisma.instructor.findUnique({
            where: { email }
          });

          if (instructor) {
            role = "INSTRUCTOR";
            userId = instructor.id;
          }
        }

        return {
          token: data.session.access_token,
          user: {
            id: userId.toString(),
            email,
            role
          }
        };
      } catch (error) {
        logger.error("Login error:", error);
        throw new Error("Failed to login");
      }
    },

    /**
     * POST - Register a new user and return an authentication token.
     * 
     * @param {*} _ - Parent resolver
     * @param {*} args - Arguments containing register input
     * @returns {Object} - Auth object containing token and user
     */
    register: async (_, { input }) => {
      try {
        const { username, email, password, role } = input;

        // Register with Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) {
          logger.error("Registration error:", authError);
          throw new Error("Failed to register user");
        }

        let userId = null;

        if (role === "ADMIN") {
          const admin = await prisma.admin.create({
            data: {
              username,
              email,
              password: "hashed_password" // TODO: Hash the password properly.
            }
          });

          userId = admin.id;
        } else if (role === "INSTRUCTOR") {
          const instructor = await prisma.instructor.create({
            data: {
              username,
              email,
              password: "hashed_password", // TODO: Hash the password properly.
              instructorDescription: "",
              instructorBio: "",
              instructorAddress: "",
              instructorTimezone: ""
            }
          });

          userId = instructor.id;
        }

        return {
          token: authData.session.access_token,
          user: {
            id: userId.toString(),
            email,
            role
          }
        };
      } catch (error) {
        logger.error("Registration error:", error);
        throw new Error("Failed to register user");
      }
    },

    /**
     * GET - Refresh the selected expired token.
     * 
     * @param {*} _ - Parent resolver
     * @param {*} args - Arguments containing token
     * @returns {Object} - Auth object containing new token and user
     */
    refreshToken: async (_, { token }) => {
      try {
        const { success, accessToken, error } = await refreshAuthToken(token);

        if (!success || error) {
          logger.error("Token refresh error:", error);
          throw new Error("Failed to refresh token");
        }

        const { valid, user } = await verifyToken(accessToken);

        if (!valid || !user) {
          throw new Error("Invalid token");
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
          token: accessToken,
          user: {
            id: userId.toString(),
            email: user.email,
            role
          }
        };
      } catch (error) {
        logger.error("Token refresh error:", error);
        throw new Error("Failed to refresh token");
      }
    },

    /**
     * POST - Logout the current user.
     * 
     * @returns {Boolean} - True if logout was successful
     */
    logout: async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          logger.error("Logout error:", error);
          return false;
        }

        return true;
      } catch (error) {
        logger.error("Logout error:", error);
        return false;
      }
    }
  }
};
