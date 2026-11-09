import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
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
      error: {
        message: "Request validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: { message: "Analysis data is invalid." } });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error.name === "MongoServerSelectionError" || error.name === "MongoNetworkError")
  ) {
    response.status(503).json({ error: { message: "Database is temporarily unavailable." } });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    response.status(409).json({ error: { message: "A conflicting record already exists." } });
    return;
  }

  if (typeof error === "object" && error !== null && "type" in error) {
    const type = (error as { type?: string }).type;
    if (type === "entity.too.large") {
      response.status(413).json({ error: { message: "Request body is too large" } });
      return;
    }
    if (type === "entity.parse.failed") {
      response.status(400).json({ error: { message: "Request body must contain valid JSON" } });
      return;
    }
  }

  console.error("Unhandled API request error");
  response.status(500).json({
    error: { message: "An unexpected server error occurred" },
  });
};
