import axios from "axios";

export interface AnalysisResult {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  createdAt: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
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
  retryAfterMs: number | null;
  retryStatus: string;
}

export interface AnalysisHistory {
  items: AnalysisResult[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "https://resume-screener-bu8t.onrender.com/api" : "/api"),
  timeout: 210_000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "Could not reach the server. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export async function analyzeResume(input: {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  jobDescription: string;
  resumeFile: File;
}): Promise<{ analysis: AnalysisResult; usage: AnalysisUsage }> {
  const formData = new FormData();
  formData.append("candidateName", input.candidateName);
  formData.append("candidateEmail", input.candidateEmail.toLowerCase());
  formData.append("jobRole", input.jobRole);
  formData.append("jobDescription", input.jobDescription);
  formData.append("resumeFile", input.resumeFile, input.resumeFile.name);
  const response = await api.post<{ analysis: AnalysisResult; usage: AnalysisUsage }>("/analysis", formData);
  return response.data;
}

export async function getAnalysisHistory(filters: {
  candidateName?: string;
  candidateEmail?: string;
  jobRole?: string;
  minScore?: string;
  maxScore?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<AnalysisHistory> {
  const response = await api.get<AnalysisHistory>("/analysis", { params: filters });
  return response.data;
}
