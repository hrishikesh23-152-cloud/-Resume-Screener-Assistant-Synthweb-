import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
export const MAX_RESUME_LENGTH = 30_000;

const requiredText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} is too short`)
    .max(maximum, `${label} must be ${maximum.toLocaleString()} characters or fewer`);

export const analysisFieldsSchema = z
  .object({
    candidateName: requiredText("Candidate name", 2, 120),
    candidateEmail: requiredText("Candidate email", 1, 254)
      .email("Enter a valid email address")
      .transform((email) => email.toLowerCase()),
    jobRole: requiredText("Job role", 2, 120),
    jobDescription: requiredText("Job description", 20, MAX_JOB_DESCRIPTION_LENGTH),
  })
  .strict();

export const analysisInputSchema = analysisFieldsSchema.extend({
  resumeText: requiredText("Resume", 20, MAX_RESUME_LENGTH),
});

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

const optionalDate = (inclusiveEnd = false) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === undefined) return undefined;
      if (inclusiveEnd && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return `${value}T23:59:59.999Z`;
      }
      return value;
    },
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
    from: optionalDate(),
    to: optionalDate(true),
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
export type AnalysisFields = z.infer<typeof analysisFieldsSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisQuery = z.infer<typeof analysisQuerySchema>;
