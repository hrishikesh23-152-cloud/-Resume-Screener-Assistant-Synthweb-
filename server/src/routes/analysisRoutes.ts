import { Router } from "express";
import { uploadResumeFile } from "../middleware/uploadResume.js";
import { createAnalysis, getAnalysis, listAnalyses } from "../controllers/analysisController.js";

export function createAnalysisRouter(): Router {
  const router = Router();
  router.post("/", uploadResumeFile, createAnalysis);
  router.get("/", listAnalyses);
  router.get("/:id", getAnalysis);
  return router;
}
