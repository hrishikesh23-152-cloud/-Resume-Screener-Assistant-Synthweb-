import { AppError } from "../errors/AppError.js";
import type { AnalysisInput, AnalysisQuery, AnalysisResult } from "../schemas/analysis.js";
import type { AnalysisUsage } from "./groqService.js";
import {
  createAnalysis,
  findAnalysisById,
  searchAnalyses,
  type AnalysisDto,
} from "../repositories/analysisRepository.js";
import { generateResumeAnalysis } from "./groqService.js";

export interface AnalysisWorkflowDependencies {
  generate(input: AnalysisInput): Promise<{ result: AnalysisResult; usage: AnalysisUsage }>;
  create(input: AnalysisInput, result: AnalysisResult): Promise<AnalysisDto>;
  list(query: AnalysisQuery): Promise<{
    items: AnalysisDto[];
    page: number;
    limit: number;
    total: number;
    pages: number;
  }>;
  get(id: string): Promise<AnalysisDto | null>;
}

export function createAnalysisWorkflow(
  dependencies: AnalysisWorkflowDependencies = {
    generate: generateResumeAnalysis,
    create: createAnalysis,
    list: searchAnalyses,
    get: findAnalysisById,
  },
) {
  return {
    async create(input: AnalysisInput) {
      const generated = await dependencies.generate(input);
      const analysis = await dependencies.create(input, generated.result);
      return { analysis, usage: generated.usage };
    },
    list: dependencies.list,
    async get(id: string) {
      const analysis = await dependencies.get(id);
      if (!analysis) throw new AppError("Analysis not found", 404);
      return analysis;
    },
  };
}

export type AnalysisWorkflow = ReturnType<typeof createAnalysisWorkflow>;
