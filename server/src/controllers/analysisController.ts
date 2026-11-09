import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { analysisRequestSchema } from "../models/analysisModel.js";
import { analyzeResume } from "../services/groqService.js";
import { extractPdfText } from "../services/resumeService.js";

export const createAnalysis: RequestHandler = async (request, response, next) => {
  try {
    if (!request.file) {
      throw new AppError("Upload a PDF resume.", 400);
    }

    const input = analysisRequestSchema.safeParse(request.body);
    if (!input.success) {
      throw new AppError(input.error.issues.map((issue) => issue.message).join("; "), 400);
    }

    const resumeText = await extractPdfText(request.file);
    const analysis = await analyzeResume(input.data, resumeText);

    response.status(200).json({ analysis });
  } catch (error) {
    next(error);
  }
};
