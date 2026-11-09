import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry.js";

describe("withRetry", () => {
  it("retries temporary failures and reports the retry count", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error("temporary"), { status: 503 }))
      .mockResolvedValue("ok");
    const result = await withRetry(operation, { sleep: async () => undefined });

    expect(result).toEqual({ value: "ok", retries: 1 });
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("honors Retry-After for rate limits", async () => {
    const sleep = vi.fn(async () => undefined);
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({
        status: 429,
        headers: new Headers({ "retry-after": "2" }),
      })
      .mockResolvedValue("ok");

    await withRetry(operation, { sleep });
    expect(sleep).toHaveBeenCalledWith(2_000);
  });

  it("does not retry permanent client errors and caps attempts", async () => {
    const permanent = vi.fn().mockRejectedValue(Object.assign(new Error("unauthorized"), { status: 401 }));
    await expect(withRetry(permanent, { sleep: async () => undefined })).rejects.toMatchObject({ status: 401 });
    expect(permanent).toHaveBeenCalledTimes(1);

    const temporary = vi.fn().mockRejectedValue(Object.assign(new Error("unavailable"), { status: 503 }));
    await expect(withRetry(temporary, { sleep: async () => undefined })).rejects.toMatchObject({ status: 503 });
    expect(temporary).toHaveBeenCalledTimes(3);
  });
});
