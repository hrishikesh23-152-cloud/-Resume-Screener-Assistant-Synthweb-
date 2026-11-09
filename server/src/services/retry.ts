type HeaderSource = {
  headers?: Headers | Record<string, string | undefined>;
  response?: { headers?: Headers | Record<string, string | undefined> };
};

function readHeader(source: unknown, name: string): string | undefined {
  if (typeof source !== "object" || source === null) return undefined;
  const candidate = source as HeaderSource;
  const headers = candidate.headers ?? candidate.response?.headers;
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  if (headers && typeof headers === "object") {
    const key = Object.keys(headers).find((header) => header.toLowerCase() === name.toLowerCase());
    if (key) return headers[key];
  }
  return undefined;
}

function statusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  const value = (error as { status?: unknown }).status;
  return typeof value === "number" ? value : undefined;
}

function parseDelay(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  const duration = value.match(/(?:(\d+(?:\.\d+)?)m)?(?:(\d+(?:\.\d+)?)s)?/i);
  if (!duration || (!duration[1] && !duration[2])) return undefined;
  return Number(duration[1] ?? 0) * 60_000 + Number(duration[2] ?? 0) * 1000;
}

function getRetryDelay(error: unknown, attempt: number, random: () => number): number {
  const retryAfter = parseRetryAfterMs(error);
  const reset = parseDelay(
    readHeader(error, "x-ratelimit-reset-requests") ?? readHeader(error, "x-ratelimit-reset-tokens"),
  );
  if (retryAfter !== null) return retryAfter;
  if (reset !== undefined) return reset;
  const base = Math.min(1_000 * 2 ** attempt, 10_000);
  return Math.round(base * (0.75 + random() * 0.5));
}

export function parseRetryAfterMs(error: unknown): number | null {
  return parseDelay(readHeader(error, "retry-after")) ?? null;
}

export interface RetryOptions {
  retries?: number;
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<{ value: T; retries: number; retryAfterMs: number | null }> {
  const retries = options.retries ?? 2;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const random = options.random ?? Math.random;
  let attempts = 0;
  let retryAfterMs: number | null = null;

  while (true) {
    try {
      return { value: await operation(), retries: attempts, retryAfterMs };
    } catch (error) {
      const status = statusCode(error);
      const retryable = status === undefined || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempts >= retries) throw error;

      retryAfterMs = parseRetryAfterMs(error);
      await sleep(getRetryDelay(error, attempts, random));
      attempts += 1;
    }
  }
}
