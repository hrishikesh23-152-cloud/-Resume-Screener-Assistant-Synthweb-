import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { message: error.message },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: { message: "Request validation failed", details: error.issues },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: string }).type === "entity.too.large"
  ) {
    response.status(413).json({
      error: { message: "Request body is too large" },
    });
    return;
  }

  response.status(500).json({
    error: { message: "An unexpected server error occurred" },
  });
};
