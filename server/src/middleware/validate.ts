import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

type RequestPart = "body" | "query" | "params";

export function validate(part: RequestPart, schema: ZodType): RequestHandler {
  return (request, response, next) => {
    const parsed = schema.safeParse(request[part]);
    if (!parsed.success) {
      next(
        new AppError(
          parsed.error.issues.map((issue) => `${issue.path.join(".") || part}: ${issue.message}`).join("; "),
          400,
        ),
      );
      return;
    }
    response.locals[part] = parsed.data;
    next();
  };
}
