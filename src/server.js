import { logger } from "./utils/logger.js";
import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  logger.info("Success, Server Started on Port 3000");
  logger.info("Route: http://localhost:3000/");
});

export default app;
