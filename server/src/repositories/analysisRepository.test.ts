import { describe, expect, it } from "vitest";
import { analysisQuerySchema } from "../schemas/analysis.js";
import { buildAnalysisFilter } from "./analysisRepository.js";

describe("MongoDB history filter builder", () => {
  it("builds safe database filters for search, score and date range", () => {
    const query = analysisQuerySchema.parse({
      candidateName: "Alex.*",
      candidateEmail: "ALEX@example.com",
      jobRole: "Backend",
      minScore: "60",
      maxScore: "90",
      from: "2026-01-01",
      to: "2026-12-31",
    });
    const filter = buildAnalysisFilter(query);

    expect(filter.candidateName).toBeInstanceOf(RegExp);
    expect((filter.candidateName as RegExp).source).toBe("Alex\\.\\*");
    expect(filter.candidateEmail).toBe("alex@example.com");
    expect(filter.matchScore).toEqual({ $gte: 60, $lte: 90 });
    expect(filter.createdAt).toMatchObject({
      $gte: new Date("2026-01-01"),
      $lte: new Date("2026-12-31"),
    });
  });
});
