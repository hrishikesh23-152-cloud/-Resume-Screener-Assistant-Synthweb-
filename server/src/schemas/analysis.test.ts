import { describe, expect, it } from "vitest";
import { analysisInputSchema, analysisQuerySchema, analysisResultSchema } from "./analysis.js";

const validInput = {
  candidateName: "  Alex Candidate ",
  candidateEmail: "ALEX@example.com",
  jobRole: "Backend Engineer",
  jobDescription: "Build reliable services and APIs using TypeScript, Node.js, and MongoDB.",
  resumeText: "Experienced engineer building production TypeScript APIs and MongoDB applications.",
};

describe("analysis input schema", () => {
  it("trims text and normalizes candidate email", () => {
    expect(analysisInputSchema.parse(validInput)).toMatchObject({
      candidateName: "Alex Candidate",
      candidateEmail: "alex@example.com",
    });
  });

  it.each([
    { ...validInput, candidateName: "   " },
    { ...validInput, candidateEmail: "not-an-email" },
    { ...validInput, jobRole: "" },
    { ...validInput, jobDescription: " " },
    { ...validInput, resumeText: "" },
    { ...validInput, resumeText: "x".repeat(30_001) },
    { ...validInput, unexpected: true },
  ])("rejects invalid input %#", (input) => {
    expect(analysisInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("analysis result schema", () => {
  const result = {
    matchScore: 80,
    matchingSkills: ["one", "two", "three", "four", "five"],
    skillGaps: ["one", "two", "three"],
    interviewQuestions: ["one?", "two?", "three?"],
  };

  it("accepts only the complete required output structure", () => {
    expect(analysisResultSchema.safeParse(result).success).toBe(true);
    expect(analysisResultSchema.safeParse({ ...result, extra: "field" }).success).toBe(false);
    expect(analysisResultSchema.safeParse({ ...result, matchingSkills: ["one"] }).success).toBe(false);
    expect(analysisResultSchema.safeParse({ ...result, matchScore: 101 }).success).toBe(false);
  });
});

describe("analysis query schema", () => {
  it("applies pagination defaults and normalizes email", () => {
    expect(analysisQuerySchema.parse({ candidateEmail: " ALEX@EXAMPLE.COM " })).toMatchObject({
      candidateEmail: "alex@example.com",
      page: 1,
      limit: 20,
    });
  });

  it("rejects invalid ranges and unsupported query parameters", () => {
    expect(analysisQuerySchema.safeParse({ minScore: "80", maxScore: "20" }).success).toBe(false);
    expect(analysisQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(analysisQuerySchema.safeParse({ other: "unexpected" }).success).toBe(false);
  });
});
