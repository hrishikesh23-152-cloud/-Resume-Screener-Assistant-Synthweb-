import { model, Schema, type InferSchemaType } from "mongoose";

const analysisSchema = new Schema(
  {
    candidateName: { type: String, required: true, trim: true, maxlength: 120 },
    candidateEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    jobRole: { type: String, required: true, trim: true, maxlength: 120 },
    jobDescription: { type: String, required: true, maxlength: 20_000 },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    matchingSkills: {
      type: [{ type: String, required: true, trim: true }],
      required: true,
      validate: { validator: (items: string[]) => items.length === 5, message: "Exactly 5 skills are required" },
    },
    skillGaps: {
      type: [{ type: String, required: true, trim: true }],
      required: true,
      validate: { validator: (items: string[]) => items.length === 3, message: "Exactly 3 gaps are required" },
    },
    interviewQuestions: {
      type: [{ type: String, required: true, trim: true }],
      required: true,
      validate: {
        validator: (items: string[]) => items.length === 3,
        message: "Exactly 3 interview questions are required",
      },
    },
  },
  { timestamps: true, collection: "analyses" },
);

analysisSchema.index({ candidateName: 1 });
analysisSchema.index({ candidateEmail: 1 });
analysisSchema.index({ jobRole: 1 });
analysisSchema.index({ matchScore: 1 });
analysisSchema.index({ createdAt: -1 });

export type AnalysisRecord = InferSchemaType<typeof analysisSchema>;
export const Analysis = model("Analysis", analysisSchema);
