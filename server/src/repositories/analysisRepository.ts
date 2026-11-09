import { Analysis } from "../models/Analysis.js";
import type { AnalysisQuery } from "../models/analysisModel.js";

export async function createAnalysisRecord(input: {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
}) {
  return Analysis.create({ ...input, candidateEmail: input.candidateEmail.toLowerCase() });
}

export async function findAnalyses(query: AnalysisQuery) {
  const filter: Record<string, unknown> = {};
  if (query.candidateName) filter.candidateName = { $regex: escapeRegex(query.candidateName), $options: "i" };
  if (query.candidateEmail) filter.candidateEmail = query.candidateEmail;
  if (query.jobRole) filter.jobRole = { $regex: escapeRegex(query.jobRole), $options: "i" };
  if (query.minScore !== undefined || query.maxScore !== undefined) {
    filter.matchScore = {
      ...(query.minScore !== undefined ? { $gte: query.minScore } : {}),
      ...(query.maxScore !== undefined ? { $lte: query.maxScore } : {}),
    };
  }
  if (query.from || query.to) {
    const dateFilter: { $gte?: Date; $lt?: Date } = {};
    if (query.from) dateFilter.$gte = new Date(`${query.from}T00:00:00.000Z`);
    if (query.to) {
      const exclusiveEnd = new Date(`${query.to}T00:00:00.000Z`);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      dateFilter.$lt = exclusiveEnd;
    }
    filter.createdAt = dateFilter;
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Analysis.find(filter)
      .select("-jobDescription")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Analysis.countDocuments(filter),
  ]);
  return { items, page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) };
}

export async function findAnalysisById(id: string) {
  return Analysis.findById(id).lean();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
