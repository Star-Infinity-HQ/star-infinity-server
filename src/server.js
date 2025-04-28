import { logger } from "./shared/logger.js";
import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { authMiddleware } from "./auth-module/middleware/auth.middleware.js";
import { authModuleTypeDefs } from "./auth-module/typedefs/index.js";
import { authResolvers, adminResolvers } from "./auth-module/resolvers/index.js";
import { arcjetProtect } from "./shared/auth.js";

dotenv.config();

// Initialize Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(arcjetProtect);

// Basic route
app.get("/", (_, res) => {
  res.send("Star Infinity API Server");
});

// Combine type definitions and resolvers
const typeDefs = [
  ...authModuleTypeDefs
];

const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...adminResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...adminResolvers.Mutation
  }
};

// Initialize Apollo Server
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    formatError: (error) => {
      logger.error("GraphQL Error:", error);
      return {
        message: error.message,
        path: error.path
      };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Start Express server
  app.listen(process.env.PORT, () => {
    logger.info(`Server started on port ${process.env.PORT}`);
    logger.info(`GraphQL endpoint: http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });
};

startApolloServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
