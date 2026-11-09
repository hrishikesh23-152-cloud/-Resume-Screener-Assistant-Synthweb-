import { Analysis } from "../models/Analysis.js";
import type { AnalysisInput, AnalysisQuery, AnalysisResult } from "../schemas/analysis.js";

type AnalysisDocument = {
  _id: { toString(): string };
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription?: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
};

export interface AnalysisDto {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription?: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

function toDto(record: AnalysisDocument): AnalysisDto {
  return {
    id: record._id.toString(),
    candidateName: record.candidateName,
    candidateEmail: record.candidateEmail,
    jobRole: record.jobRole,
    ...(record.jobDescription !== undefined ? { jobDescription: record.jobDescription } : {}),
    matchScore: record.matchScore,
    matchingSkills: record.matchingSkills,
    skillGaps: record.skillGaps,
    interviewQuestions: record.interviewQuestions,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function escapedRegex(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export function buildAnalysisFilter(query: AnalysisQuery): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (query.candidateName) filter.candidateName = escapedRegex(query.candidateName);
  if (query.candidateEmail) filter.candidateEmail = query.candidateEmail;
  if (query.jobRole) filter.jobRole = escapedRegex(query.jobRole);
  if (query.minScore !== undefined || query.maxScore !== undefined) {
    filter.matchScore = {
      ...(query.minScore !== undefined ? { $gte: query.minScore } : {}),
      ...(query.maxScore !== undefined ? { $lte: query.maxScore } : {}),
    };
  }
  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    };
  }
  return filter;
}

export async function createAnalysis(
  input: AnalysisInput,
  result: AnalysisResult,
): Promise<AnalysisDto> {
  const record = await Analysis.create({
    candidateName: input.candidateName,
    candidateEmail: input.candidateEmail,
    jobRole: input.jobRole,
    jobDescription: input.jobDescription,
    ...result,
  });
  return toDto(record);
}

export async function findAnalysisById(id: string): Promise<AnalysisDto | null> {
  const record = await Analysis.findById(id).lean<AnalysisDocument | null>();
  return record ? toDto(record) : null;
}

export async function searchAnalyses(query: AnalysisQuery): Promise<{
  items: AnalysisDto[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}> {
  const filter = buildAnalysisFilter(query);

  const [records, total] = await Promise.all([
    Analysis.find(filter)
      .select("candidateName candidateEmail jobRole matchScore createdAt updatedAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<AnalysisDocument[]>(),
    Analysis.countDocuments(filter),
  ]);
  return {
    items: records.map(toDto),
    page: query.page,
    limit: query.limit,
    total,
    pages: Math.ceil(total / query.limit),
  };
}
