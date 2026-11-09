import { Router } from "express";
import { uploadResumeFile } from "../middleware/uploadResume.js";
import { createAnalysis } from "../controllers/analysisController.js";

export function createAnalysisRouter(): Router {
  const router = Router();
  router.post("/", uploadResumeFile, createAnalysis);
  return router;
}
