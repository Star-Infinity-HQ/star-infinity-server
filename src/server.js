import { logger } from "./shared/logger.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  logger.info(`Success, Server Started on Port: ${process.env.PORT}`);
  logger.info(`Route: http://localhost:${process.env.PORT}/`);
});

export default app;
