import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
export const MAX_RESUME_LENGTH = 30_000;

export const analysisRequestSchema = z
  .object({
    jobRole: z.string().trim().min(2, "Job role is required").max(120),
    jobDescription: z
      .string()
      .trim()
      .min(20, "Add at least 20 characters to the job description")
      .max(MAX_JOB_DESCRIPTION_LENGTH),
  })
  .strict();

export const analysisResponseSchema = z
  .object({
    matchScore: z.number().int().min(0).max(100),
    matchingSkills: z.array(z.string().trim().min(1)).length(5),
    skillGaps: z.array(z.string().trim().min(1)).length(3),
    interviewQuestions: z.array(z.string().trim().min(1)).length(3),
  })
  .strict();

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
