import axios from "axios";

export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000/api" : "/api"),
  timeout: 120_000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "Could not reach the server. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export async function analyzeResume(input: {
  jobRole: string;
  jobDescription: string;
  resumeFile: File;
}): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("jobRole", input.jobRole);
  formData.append("jobDescription", input.jobDescription);
  formData.append("resumeFile", input.resumeFile, input.resumeFile.name);
  const response = await api.post<{ analysis: AnalysisResult }>("/analysis", formData);
  return response.data.analysis;
}
