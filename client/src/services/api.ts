import axios from "axios";

export interface Analysis {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription?: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisUsage {
  tokensUsed: { prompt: number | null; completion: number | null; total: number | null };
  organizationQuota: {
    requestLimit: number | null;
    requestsRemaining: number | null;
    tokenLimit: number | null;
    tokensRemaining: number | null;
    requestsReset: string | null;
    tokensReset: string | null;
  };
  retryCount: number;
  retryAfterMs: number | null;
}

export interface AnalysisFilters {
  candidateName?: string;
  candidateEmail?: string;
  jobRole?: string;
  minScore?: string;
  maxScore?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export interface AnalysisHistory {
  items: Analysis[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000/api" : "/api"),
  timeout: 35_000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "Could not reach the server. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export async function createAnalysis(input: {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription: string;
  resumeText: string;
  resumeFile: File;
}): Promise<{ analysis: Analysis; usage: AnalysisUsage }> {
  const formData = new FormData();
  formData.append("candidateName", input.candidateName);
  formData.append("candidateEmail", input.candidateEmail);
  formData.append("jobRole", input.jobRole);
  formData.append("jobDescription", input.jobDescription);
  formData.append("resumeFile", input.resumeFile, input.resumeFile.name);
  const response = await api.post<{ analysis: Analysis; usage: AnalysisUsage }>("/analysis", formData);
  return response.data;
}

export async function getAnalysisHistory(filters: AnalysisFilters): Promise<AnalysisHistory> {
  const response = await api.get<AnalysisHistory>("/analysis", { params: filters });
  return response.data;
}

export async function getAnalysis(id: string): Promise<Analysis> {
  const response = await api.get<{ analysis: Analysis }>(`/analysis/${encodeURIComponent(id)}`);
  return response.data.analysis;
}
