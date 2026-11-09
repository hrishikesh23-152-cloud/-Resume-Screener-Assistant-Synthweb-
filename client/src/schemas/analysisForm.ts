import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
export const MAX_RESUME_LENGTH = 30_000;

const requiredText = (label: string, minimum: number, maximum: number) =>
  z.string().trim().min(minimum, `${label} is too short`).max(maximum, `${label} is too long`);

export const analysisFormSchema = z
  .object({
    candidateName: requiredText("Candidate name", 2, 120),
    candidateEmail: requiredText("Candidate email", 1, 254)
      .email("Enter a valid email address")
      .transform((email) => email.toLowerCase()),
    jobRole: requiredText("Job role", 2, 120),
    jobDescription: requiredText("Job description", 20, MAX_JOB_DESCRIPTION_LENGTH),
    resumeText: requiredText("Resume", 20, MAX_RESUME_LENGTH),
  })
  .strict();

export type AnalysisFormInput = z.input<typeof analysisFormSchema>;
export type AnalysisFormValues = z.output<typeof analysisFormSchema>;
