import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
export const MAX_RESUME_LENGTH = 30_000;

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(maximum, `${label} must be ${maximum.toLocaleString()} characters or fewer`);

export const analysisInputSchema = z
  .object({
    candidateName: requiredText("Candidate name", 120),
    candidateEmail: requiredText("Candidate email", 254)
      .email("Enter a valid email address")
      .transform((email) => email.toLowerCase()),
    jobRole: requiredText("Job role", 120),
    jobDescription: requiredText("Job description", MAX_JOB_DESCRIPTION_LENGTH),
    resumeText: requiredText("Resume", MAX_RESUME_LENGTH),
  })
  .strict();

const nonEmptyString = z.string().trim().min(1);

export const analysisResultSchema = z
  .object({
    matchScore: z.number().int().min(0).max(100),
    matchingSkills: z.array(nonEmptyString).length(5),
    skillGaps: z.array(nonEmptyString).length(3),
    interviewQuestions: z.array(nonEmptyString).length(3),
  })
  .strict();

export const analysisIdSchema = z.object({
  id: z.string().regex(/^[\da-f]{24}$/i, "Analysis ID must be a valid MongoDB ObjectId"),
});

const optionalTrimmedText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(maximum).optional(),
  );

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.date().optional(),
);

export const analysisQuerySchema = z
  .object({
    candidateName: optionalTrimmedText(120),
    candidateEmail: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() !== ""
          ? value.trim().toLowerCase()
          : value === ""
            ? undefined
            : value,
      z.string().email().max(254).optional(),
    ),
    jobRole: optionalTrimmedText(120),
    minScore: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().min(0).max(100).optional(),
    ),
    maxScore: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().min(0).max(100).optional(),
    ),
    from: optionalDate,
    to: optionalDate,
    page: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().min(1).default(1),
    ),
    limit: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : value),
      z.coerce.number().int().min(1).max(100).default(20),
    ),
  })
  .strict()
  .superRefine((query, context) => {
    if (query.minScore !== undefined && query.maxScore !== undefined && query.minScore > query.maxScore) {
      context.addIssue({
        code: "custom",
        message: "minScore must not exceed maxScore",
        path: ["minScore"],
      });
    }
    if (query.from && query.to && query.from > query.to) {
      context.addIssue({
        code: "custom",
        message: "from must not be later than to",
        path: ["from"],
      });
    }
  });

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisQuery = z.infer<typeof analysisQuerySchema>;
