import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("groq-sdk", () => ({
  default: vi.fn(function MockGroq() {
    return { chat: { completions: { create: mocks.create } } };
  }),
}));

import { generateResumeAnalysis } from "./groqService.js";
import { analysisInputSchema } from "../schemas/analysis.js";

const input = analysisInputSchema.parse({
  candidateName: "Alex Candidate",
  candidateEmail: "alex@example.com",
  jobRole: "Backend Engineer",
  jobDescription: "Build reliable services and APIs using TypeScript, Node.js, and MongoDB.",
  resumeText: "Experienced engineer building production TypeScript APIs and MongoDB applications.",
});

const validOutput = {
  matchScore: 80,
  matchingSkills: ["Node.js", "Express", "MongoDB", "TypeScript", "REST APIs"],
  skillGaps: ["Cloud experience", "CI/CD", "Automated testing"],
  interviewQuestions: ["Question one?", "Question two?", "Question three?"],
};

function response(content: string, promptTokens = 100) {
  return {
    withResponse: async () => ({
      data: {
        choices: [{ message: { content } }],
        usage: { prompt_tokens: promptTokens, completion_tokens: 50, total_tokens: promptTokens + 50 },
      },
      response: {
        headers: new Headers({
          "x-ratelimit-limit-requests": "100",
          "x-ratelimit-remaining-requests": "98",
          "x-ratelimit-limit-tokens": "10000",
          "x-ratelimit-remaining-tokens": "9000",
          "x-ratelimit-reset-requests": "1m",
          "x-ratelimit-reset-tokens": "1m",
        }),
      },
    }),
  };
}

function failure(error: Error) {
  return {
    withResponse: async () => {
      throw error;
    },
  };
}

beforeEach(() => {
  vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");
  vi.stubEnv("GROQ_API_KEY", "test-key");
  vi.stubEnv("GROQ_MODEL", "test-model");
  vi.stubEnv("CLIENT_URL", "http://localhost:5173");
  mocks.create.mockReset();
});

describe("Groq analysis integration", () => {
  it("uses JSON mode and returns validated output with sanitized usage data", async () => {
    mocks.create.mockReturnValue(response(JSON.stringify(validOutput)));
    const generated = await generateResumeAnalysis(input);

    expect(generated.result).toEqual(validOutput);
    expect(generated.usage.tokensUsed).toEqual({ prompt: 100, completion: 50, total: 150 });
    expect(generated.usage.organizationQuota).toMatchObject({
      requestLimit: 100,
      requestsRemaining: 98,
      tokenLimit: 10_000,
      tokensRemaining: 9_000,
    });
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.create.mock.calls[0][0].response_format).toEqual({ type: "json_object" });
  });

  it("regenerates malformed output at most once and counts both analyses' tokens", async () => {
    mocks.create
      .mockReturnValueOnce(response("{invalid json"))
      .mockReturnValueOnce(response(JSON.stringify(validOutput), 120));

    const generated = await generateResumeAnalysis(input);
    expect(generated.result).toEqual(validOutput);
    expect(generated.usage.tokensUsed).toEqual({ prompt: 220, completion: 100, total: 320 });
    expect(generated.usage.retryCount).toBe(1);
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(mocks.create.mock.calls[1][0].messages.at(-1).content).toContain("Regenerate the evaluation");
  });

  it("rejects malformed output after a single regeneration", async () => {
    mocks.create.mockReturnValue(response(JSON.stringify({ matchScore: 101 })));
    await expect(generateResumeAnalysis(input)).rejects.toMatchObject({ statusCode: 502 });
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });

  it("retries 429 responses using Retry-After, but does not retry bad credentials", async () => {
    const rateLimitError = Object.assign(new Error("limited"), {
      status: 429,
      headers: new Headers({ "retry-after": "0" }),
    });
    mocks.create
      .mockRejectedValueOnce(rateLimitError)
      .mockReturnValueOnce(response(JSON.stringify(validOutput)));
    const generated = await generateResumeAnalysis(input);
    expect(generated.usage.retryCount).toBe(1);
    expect(mocks.create).toHaveBeenCalledTimes(2);

    mocks.create.mockReset();
    mocks.create.mockReturnValueOnce(
      failure(Object.assign(new Error("unauthorized"), { status: 401 })),
    );
    await expect(generateResumeAnalysis(input)).rejects.toMatchObject({ statusCode: 502 });
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });
});
