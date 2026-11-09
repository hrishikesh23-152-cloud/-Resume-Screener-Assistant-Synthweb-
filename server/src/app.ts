import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { AppError } from "./errors/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createAnalysisWorkflow, type AnalysisWorkflow } from "./services/analysisWorkflow.js";
import { createAnalysisRouter } from "./routes/analysisRoutes.js";

export function createApp(workflow: AnalysisWorkflow = createAnalysisWorkflow()) {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new AppError("Origin is not allowed by CORS", 403));
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "64kb" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/analysis", createAnalysisRouter(workflow));
  app.use((_request, response) => response.status(404).json({ error: { message: "Not found" } }));
  app.use(errorHandler);
  return app;
}
