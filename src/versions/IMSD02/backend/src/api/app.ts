import express from "express";
import type pg from "pg";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createApiRouter } from "./routes/index.js";

export function createApp(pool: pg.Pool) {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173"
    })
  );
  app.use(requestLogger);
  app.use("/api", createApiRouter(pool));
  app.use(errorHandler);
  return app;
}
