import express from "express";
import { requestIdMiddleware } from "./api/middleware/requestId.js";
import { loggerMiddleware } from "./api/middleware/logger.js";
import { errorHandlerMiddleware } from "./api/middleware/errorHandler.js";
import { buildRoutes } from "./api/routes/index.js";
import type pg from "pg";

export function buildApp(pool: pg.Pool) {
  const app = express();

  app.use(express.json({ limit: "256kb" }));
  app.use(requestIdMiddleware());
  app.use(loggerMiddleware());

  app.use("/api", buildRoutes(pool));

  app.use(errorHandlerMiddleware());
  return app;
}

