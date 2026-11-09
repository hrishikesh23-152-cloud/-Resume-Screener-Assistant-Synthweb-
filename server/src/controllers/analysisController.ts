import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import {
  analysisIdSchema,
  analysisQuerySchema,
  analysisRequestSchema,
} from "../models/analysisModel.js";
import { createAnalysisRecord, findAnalyses, findAnalysisById } from "../repositories/analysisRepository.js";
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
    const { analysis: result, usage } = await analyzeResume(input.data, resumeText);
    const analysis = await createAnalysisRecord({
      ...input.data,
      ...result,
    });
    response.status(201).json({ analysis, usage });
  } catch (error) {
    next(error);
  }
};

export const listAnalyses: RequestHandler = async (request, response, next) => {
  try {
    const parsed = analysisQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues.map((issue) => issue.message).join("; "), 400);
    }
    const query = parsed.data;
    response.json(await findAnalyses(query));
  } catch (error) {
    next(error);
  }
};

export const getAnalysis: RequestHandler = async (request, response, next) => {
  try {
    const parsed = analysisIdSchema.safeParse(request.params);
    if (!parsed.success) {
      throw new AppError("Invalid analysis ID.", 400);
    }
    const analysis = await findAnalysisById(parsed.data.id);
    if (!analysis) throw new AppError("Analysis not found.", 404);
    response.json({ analysis });
  } catch (error) {
    next(error);
  }
};
