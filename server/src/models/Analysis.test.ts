import { describe, expect, it } from "vitest";
import { Analysis } from "./Analysis.js";

describe("Analysis model", () => {
  const validRecord = {
    candidateName: "Alex Candidate",
    candidateEmail: "ALEX@example.com",
    jobRole: "Backend Engineer",
    jobDescription: "Build reliable services and APIs.",
    matchScore: 80,
    matchingSkills: ["one", "two", "three", "four", "five"],
    skillGaps: ["one", "two", "three"],
    interviewQuestions: ["one?", "two?", "three?"],
  };

  it("validates analysis records, normalizes email, and does not store resume text", () => {
    const record = new Analysis({ ...validRecord, resumeText: "temporary input" });
    expect(record.validateSync()).toBeUndefined();
    expect(record.candidateEmail).toBe("alex@example.com");
    expect(record.toObject()).not.toHaveProperty("resumeText");
    expect(Analysis.schema.path("candidateEmail")).toBeDefined();
    expect(Analysis.schema.path("candidateEmail").options.unique).not.toBe(true);
  });

  it("rejects invalid scores and incorrectly sized model output arrays", () => {
    const invalid = new Analysis({
      ...validRecord,
      matchScore: 120,
      matchingSkills: ["only one"],
    });
    expect(invalid.validateSync()).toBeDefined();
  });
});
