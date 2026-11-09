import { model, Schema, type InferSchemaType } from "mongoose";

const analysisSchema = new Schema(
  {
    candidateName: { type: String, required: true, trim: true, maxlength: 120 },
    candidateEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    jobRole: { type: String, required: true, trim: true, maxlength: 120 },
    jobDescription: { type: String, required: true, maxlength: 20_000 },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    matchingSkills: { type: [String], required: true, validate: (items: string[]) => items.length === 5 },
    skillGaps: { type: [String], required: true, validate: (items: string[]) => items.length === 3 },
    interviewQuestions: { type: [String], required: true, validate: (items: string[]) => items.length === 3 },
  },
  { timestamps: true, collection: "analyses" },
);

analysisSchema.index({ candidateEmail: 1 });
analysisSchema.index({ candidateName: 1 });
analysisSchema.index({ jobRole: 1 });
analysisSchema.index({ matchScore: 1 });
analysisSchema.index({ createdAt: -1 });

export type AnalysisDocument = InferSchemaType<typeof analysisSchema>;
export const Analysis = model("Analysis", analysisSchema);
