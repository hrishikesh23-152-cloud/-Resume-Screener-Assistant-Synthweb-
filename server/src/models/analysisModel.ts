import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
export const MAX_RESUME_LENGTH = 30_000;

export const analysisRequestSchema = z
  .object({
    candidateName: z.string().trim().min(2, "Candidate name is required").max(120),
    candidateEmail: z.string().trim().email("Enter a valid candidate email").max(254).transform((email) => email.toLowerCase()),
    jobRole: z.string().trim().min(2, "Job role is required").max(120),
    jobDescription: z
      .string()
      .trim()
      .min(20, "Add at least 20 characters to the job description")
      .max(MAX_JOB_DESCRIPTION_LENGTH),
  })
  .strict();

export const analysisQuerySchema = z
  .object({
    candidateName: z.string().trim().min(1).max(120).optional(),
    candidateEmail: z.string().trim().email().max(254).transform((email) => email.toLowerCase()).optional(),
    jobRole: z.string().trim().min(1).max(120).optional(),
    minScore: z.coerce.number().min(0).max(100).optional(),
    maxScore: z.coerce.number().min(0).max(100).optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict()
  .refine(
    ({ minScore, maxScore, from, to }) =>
      (minScore === undefined || maxScore === undefined || minScore <= maxScore) &&
      (from === undefined || to === undefined || from <= to),
    { message: "Check that minimum values do not exceed maximum values", path: ["minScore"] },
  );

export const analysisIdSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid analysis ID") });

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
export type AnalysisQuery = z.infer<typeof analysisQuerySchema>;
