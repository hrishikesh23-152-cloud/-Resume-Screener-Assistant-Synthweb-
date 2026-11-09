import { z } from "zod";

export const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
const requiredText = (label: string, minimum: number, maximum: number) =>
  z.string().trim().min(minimum, `${label} is too short`).max(maximum, `${label} is too long`);

export const analysisFormSchema = z
  .object({
    jobRole: requiredText("Job role", 2, 120),
    jobDescription: requiredText("Job description", 20, MAX_JOB_DESCRIPTION_LENGTH),
    resumeFile: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File),
  })
  .strict();

export type AnalysisFormInput = z.input<typeof analysisFormSchema>;
export type AnalysisFormValues = z.output<typeof analysisFormSchema>;
