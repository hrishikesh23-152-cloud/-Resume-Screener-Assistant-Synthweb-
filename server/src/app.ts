import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler.js";
import { createAnalysisRouter } from "./routes/analysisRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());

  const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: allowedOrigins,
    })
  );

  app.use(express.json({ limit: "350kb" }));

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/analysis", createAnalysisRouter());

  app.use("/api", (_req, res) => {
    res.status(404).json({
      error: { message: "API route not found" },
    });
  });

  app.use(errorHandler);

  return app;
}
