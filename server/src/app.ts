
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

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://your-frontend.onrender.com",
      ],
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
