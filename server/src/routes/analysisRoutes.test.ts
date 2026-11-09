import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { createAnalysisWorkflow } from "../services/analysisWorkflow.js";
import type { AnalysisDto } from "../repositories/analysisRepository.js";
import type { AnalysisUsage } from "../services/groqService.js";
import type { AnalysisInput, AnalysisQuery, AnalysisResult } from "../schemas/analysis.js";

const validInput: AnalysisInput = {
  candidateName: "Alex Candidate",
  candidateEmail: "alex@example.com",
  jobRole: "Backend Engineer",
  jobDescription: "Build reliable services and APIs using TypeScript, Node.js, and MongoDB.",
  resumeText: "Experienced engineer building production TypeScript APIs and MongoDB applications.",
};
const result: AnalysisResult = {
  matchScore: 80,
  matchingSkills: ["Node.js", "Express", "MongoDB", "TypeScript", "REST APIs"],
  skillGaps: ["Cloud experience", "CI/CD", "Automated testing"],
  interviewQuestions: ["Question one?", "Question two?", "Question three?"],
};
const usage: AnalysisUsage = {
  tokensUsed: { prompt: 100, completion: 50, total: 150 },
  organizationQuota: {
    requestLimit: 100,
    requestsRemaining: 99,
    tokenLimit: 10_000,
    tokensRemaining: 9_850,
    requestsReset: "1m",
    tokensReset: "1m",
  },
  retryCount: 0,
};
let server: Server | undefined;

function createTestServer() {
  const record: AnalysisDto = {
    id: "0123456789abcdef01234567",
    candidateName: validInput.candidateName,
    candidateEmail: validInput.candidateEmail,
    jobRole: validInput.jobRole,
    jobDescription: validInput.jobDescription,
    ...result,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const workflow = createAnalysisWorkflow({
    generate: vi.fn(async () => ({ result, usage })),
    create: vi.fn(async (input: AnalysisInput, generated: AnalysisResult) => ({
      id: record.id,
      candidateName: input.candidateName,
      candidateEmail: input.candidateEmail,
      jobRole: input.jobRole,
      jobDescription: input.jobDescription,
      ...generated,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })),
    list: vi.fn(async (_query: AnalysisQuery) => ({
      items: [{ ...record, jobDescription: undefined }],
      page: 1,
      limit: 20,
      total: 1,
      pages: 1,
    })),
    get: vi.fn(async (id: string) => (id === record.id ? record : null)),
  });

  server = createApp(workflow).listen(0);
  return once(server, "listening").then(() => {
    const address = server?.address() as AddressInfo;
    return `http://127.0.0.1:${address.port}`;
  });
}

afterEach(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }
  server = undefined;
});

describe("analysis HTTP API", () => {
  it("validates direct API input, returns the result, and includes sanitized usage", async () => {
    const baseUrl = await createTestServer();
    const response = await fetch(`${baseUrl}/api/analysis`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validInput, candidateEmail: "ALEX@example.com" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.analysis.candidateEmail).toBe("alex@example.com");
    expect(body.analysis.resumeText).toBeUndefined();
    expect(body.usage.tokensUsed.total).toBe(150);
    expect(body.usage.organizationQuota.tokensRemaining).toBe(9_850);
  });

  it("rejects invalid input and oversized JSON", async () => {
    const baseUrl = await createTestServer();
    const invalid = await fetch(`${baseUrl}/api/analysis`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validInput, candidateName: " " }),
    });
    expect(invalid.status).toBe(400);

    const oversized = await fetch(`${baseUrl}/api/analysis`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "x".repeat(70_000) }),
    });
    expect(oversized.status).toBe(413);
  });

  it("supports query validation and individual analysis lookup", async () => {
    const baseUrl = await createTestServer();
    const history = await fetch(`${baseUrl}/api/analysis?minScore=60&maxScore=90&page=1`);
    const historyBody = await history.json();
    expect(history.status).toBe(200);
    expect(historyBody.total).toBe(1);

    const invalidRange = await fetch(`${baseUrl}/api/analysis?minScore=90&maxScore=20`);
    expect(invalidRange.status).toBe(400);

    const detail = await fetch(`${baseUrl}/api/analysis/0123456789abcdef01234567`);
    expect(detail.status).toBe(200);
    expect((await detail.json()).analysis.id).toBe("0123456789abcdef01234567");

    const invalidId = await fetch(`${baseUrl}/api/analysis/not-an-id`);
    expect(invalidId.status).toBe(400);
    const missing = await fetch(`${baseUrl}/api/analysis/111111111111111111111111`);
    expect(missing.status).toBe(404);
  });

  it("blocks origins outside the configured allowlist", async () => {
    const baseUrl = await createTestServer();
    const response = await fetch(`${baseUrl}/api/health`, { headers: { origin: "https://untrusted.example" } });
    expect(response.status).toBe(403);
  });
});
