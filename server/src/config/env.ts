import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GROQ_MODEL: z.string().min(1).default("openai/gpt-oss-120b"),
  CLIENT_URL: z
    .string()
    .min(1)
    .refine(
      (origins) =>
        origins
          .split(",")
          .every((origin) => origin.trim() !== "*" && z.string().url().safeParse(origin.trim()).success),
      "CLIENT_URL must contain explicit, valid origins",
    )
    .default("http://localhost:5173"),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server configuration: ${details}`);
  }
  return parsed.data;
}
